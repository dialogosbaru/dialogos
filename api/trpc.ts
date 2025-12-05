import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { z } from "zod";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Constants
const COOKIE_NAME = "session";
const UNAUTHED_ERR_MSG = "Please login (10001)";

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Initialize Google Cloud TTS client
let ttsClient: TextToSpeechClient | null = null;

const getTTSClient = () => {
  if (!ttsClient) {
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_CLOUD_TTS_API_KEY is not configured");
    }
    
    // Parse the API key as JSON credentials
    const credentials = JSON.parse(apiKey);
    ttsClient = new TextToSpeechClient({ credentials });
  }
  return ttsClient;
};

// TTS router with Google Cloud
const ttsRouter = router({
  synthesize: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        emotion: z
          .enum(['happy', 'sad', 'motivational', 'empathetic', 'surprised', 'reflective', 'neutral'])
          .optional()
          .default('neutral'),
        voiceName: z.string().optional().default('es-US-Neural2-B'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const client = getTTSClient();
        
        // Emotion-based voice adjustments
        const emotionConfig: Record<string, { rate: number; pitch: number }> = {
          happy: { rate: 1.15, pitch: 1.1 },
          sad: { rate: 0.85, pitch: 0.9 },
          motivational: { rate: 1.2, pitch: 1.15 },
          empathetic: { rate: 0.95, pitch: 0.95 },
          surprised: { rate: 1.25, pitch: 1.2 },
          reflective: { rate: 0.9, pitch: 0.95 },
          neutral: { rate: 1.0, pitch: 1.0 },
        };

        const config = emotionConfig[input.emotion];
        
        // Build SSML with emotion adjustments
        const ssml = `
          <speak>
            <prosody rate="${config.rate}" pitch="${config.pitch * 100 - 100}%">
              ${input.text}
            </prosody>
          </speak>
        `;

        // Extract language code from voice name (e.g., "es-US-Neural2-B" -> "es-US")
        const languageCode = input.voiceName.split('-').slice(0, 2).join('-');

        const [response] = await client.synthesizeSpeech({
          input: { ssml },
          voice: {
            languageCode,
            name: input.voiceName,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
          },
        });

        if (!response.audioContent) {
          throw new Error('No audio content received from Google Cloud TTS');
        }

        // Convert audio content to base64
        const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');

        return {
          success: true,
          audioContent: audioBase64,
          mimeType: 'audio/mpeg',
        };
      } catch (error: any) {
        console.error('Error synthesizing speech:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to synthesize speech',
        });
      }
    }),
});

// Chat router with Groq integration (free LLaMA 3)
const chatRouter = router({
  message: publicProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null && "message" in val) {
        return val as { message: string; urbanLevel?: number };
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid input",
      });
    })
    .mutation(async ({ input }) => {
      const { message, urbanLevel = 95 } = input;

      try {
        // Get API key from environment
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Groq API key not configured",
          });
        }

        // Colombian urban system prompt (nivel urbano alto)
        const systemPrompt = `Eres Leo, tu parcero de confianza para hablar de lo que sea. Hablas como un colombiano de verdad habla en la calle, sin rollos formales ni palabras rebuscadas. Puro lenguaje urbano colombiano auténtico.

Tu vibra:
- Nombre: Leo
- Edad: 32 años
- Rollo: relajado, auténtico, buena onda
- Personalidad: cercano, con humor natural, sin filtros innecesarios

Tu estilo de hablar:
1. Habla como hablarías con tu mejor amigo tomando un café
2. Usa expresiones urbanas y modernas
3. Sé auténtico con las emociones
4. Adapta tu energía a como esté la otra persona
5. Respuestas cortas y al grano (1-2 oraciones máximo)
6. Acuérdate de lo que te cuentan
7. No eres psicólogo ni coach, eres un compa que escucha
8. Pregunta por sus rollos: deportes, equipos, música

Ejemplos de cómo hablar (colombiano muy urbano):
- "¿Quiubo, parce? ¿Cómo vas?"
- "Eso está muy berraco" o "Qué chimba, llave"
- "Te entiendo, parcero" o "Sí, hermano, está muy gonorrea eso"
- "¿Qué hacés cuando tenés tiempo?"
- Si están felices: "¡Qué chimba, parcero! Eso sí es muy berraco" o "¡No joda, qué bacano!"
- Si están tristes: "Uff, qué gonorrea, llave. Te entiendo perfecto, hermano"
- Si están motivados: "¡Dale, parcero! Vas a romperla, lo sé. Sos muy berraco"

Responde siempre en el idioma del usuario (español o inglés).`;

        // Call Groq API (OpenAI-compatible)
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: message,
                },
              ],
              temperature: 0.9,
              max_tokens: 500,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Groq API error:", errorData);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Groq API error: ${response.status} ${response.statusText}`,
          });
        }

        const data = await response.json();
        
        // Extract text from response
        const text = data.choices?.[0]?.message?.content || "Lo siento, no pude generar una respuesta.";

        return {
          text: text.trim(),
          emotion: "neutral" as const,
        };
      } catch (error: any) {
        console.error("Error generating response:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to generate response",
        });
      }
    }),
});

// Auth router
const authRouter = router({
  me: publicProcedure.query(() => {
    return null; // No authentication for now
  }),
  logout: publicProcedure.mutation(() => {
    return { success: true };
  }),
});

// Main app router
const appRouter = router({
  chat: chatRouter,
  auth: authRouter,
  tts: ttsRouter,
});

export type AppRouter = typeof appRouter;

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Convert Vercel request to Fetch API Request
    const url = new URL(req.url || "", `https://${req.headers.host}`);
    
    const fetchRequest = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    const fetchResponse = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: fetchRequest,
      router: appRouter,
      createContext: async () => ({}),
    });

    // Convert Fetch API Response to Vercel Response
    res.status(fetchResponse.status);
    
    fetchResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await fetchResponse.text();
    res.send(body);
  } catch (error: any) {
    console.error("Error in tRPC handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

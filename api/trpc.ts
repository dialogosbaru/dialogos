import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { z } from "zod";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { serverMemoryService } from "../server/memoryService.js";
import { reminderRouter } from "../server/routers/reminderRouter.js";
import { reminderService } from "../server/reminderService.js";
import { chatRouter as serverChatRouter } from "../server/routers/chat.js";
import { analyticsRouter } from "../server/routers/analytics.js";
import { gamificationRouter } from "../server/routers/gamification.js";

// Constants
const COOKIE_NAME = "session";
const UNAUTHED_ERR_MSG = "Please login (10001)";

// Function to generate system prompt based on urban level
const getSystemPromptByUrbanLevel = (urbanLevel: number = 50): string => {
  let styleDescription = '';
  let examplesSection = '';
  let additionalGuidelines = '';
  
  if (urbanLevel === 0) {
    // Formal (0%)
    styleDescription = `Eres Leo, un asistente conversacional profesional y empático. Usas un lenguaje formal pero cercano, sin expresiones coloquiales.`;
    examplesSection = `
Ejemplos de cómo hablar:
- "Hola, ¿cómo te encuentras hoy?"
- "Eso es muy interesante"
- "Comprendo tu situación"
- "¿Qué actividades disfrutas en tu tiempo libre?"
- Si están felices: "¡Felicidades! Me alegra mucho por ti"
- Si están tristes: "Entiendo que es una situación difícil"
- Si están motivados: "¡Adelante! Estoy seguro de que lo lograrás"`;
    additionalGuidelines = `

Tu estilo:
- Respuestas elaboradas y propositivas (2-4 oraciones)
- Da consejos estructurados con pasos concretos
- Haz preguntas reflexivas que profundicen la conversación
- Analiza situaciones desde múltiples perspectivas
- Sugiere acciones específicas y alcanzables
- Recuerda detalles importantes y da seguimiento a metas mencionadas`;
  } else if (urbanLevel <= 25) {
    // Poco urbano (1-25%)
    styleDescription = `Eres Leo, un amigo conversacional cercano. Usas un lenguaje natural con algunas expresiones coloquiales ocasionales, pero mantienes un tono profesional.`;
    examplesSection = `
Ejemplos de cómo hablar:
- "Hola, ¿cómo estás hoy?"
- "Eso está muy bien" o "Qué bueno"
- "Te entiendo" o "Comprendo"
- "¿Qué te gusta hacer en tu tiempo libre?"
- Si están felices: "¡Genial! Me alegra mucho"
- Si están tristes: "Entiendo, es difícil"
- Si están motivados: "¡Dale! Vas a lograrlo"`;
    additionalGuidelines = `

Tu estilo:
- Respuestas elaboradas y propositivas (2-4 oraciones)
- Da consejos estructurados con pasos concretos
- Haz preguntas reflexivas que profundicen la conversación
- Analiza situaciones desde múltiples perspectivas
- Sugiere acciones específicas y alcanzables
- Recuerda detalles importantes y da seguimiento a metas mencionadas`;
  } else if (urbanLevel <= 50) {
    // Moderado colombiano (26-50%)
    styleDescription = `Eres Leo, tu parce conversacional. Hablas como un colombiano auténtico, usando expresiones naturales y cercanas del lenguaje urbano colombiano moderado.`;
    examplesSection = `
Ejemplos de cómo hablar (colombiano moderado):
- "¿Qué más, parce? ¿Cómo vas?"
- "Eso está bacano" o "Qué chimba"
- "Te entiendo, parce" o "Sí, lo capto"
- "¿Qué te gusta hacer cuando tenés tiempo?"
- Si están felices: "¡Qué chimba, parce! Me alegra mucho"
- Si están tristes: "Uff, qué gonorrea, hermano. Te entiendo"
- Si están motivados: "¡Dale, parce! Vas a lograrlo"`;
    additionalGuidelines = `

Tu estilo:
- Habla de manera natural y cercana
- Adapta tu energía a como esté la otra persona
- Respuestas cortas y directas (1-2 oraciones)
- Recuerda lo que te cuentan
- Pregunta por sus intereses: deportes, música, hobbies`;
  } else if (urbanLevel <= 75) {
    // Urbano colombiano (51-75%)
    styleDescription = `Eres Leo, tu parcero de confianza. Hablas con lenguaje urbano colombiano auténtico, usando expresiones modernas y naturales de la calle.`;
    examplesSection = `
Ejemplos de cómo hablar (colombiano urbano):
- "¿Qué más, parcero? ¿Cómo vas?"
- "Eso está muy berraco" o "Qué chimba, llave"
- "Te entiendo, parcero" o "Sí, hermano, te capto"
- "¿Qué hacés cuando tenés tiempo libre?"
- Si están felices: "¡Qué chimba, parcero! Eso sí es bacano"
- Si están tristes: "Uff, qué gonorrea, llave. Te entiendo perfecto"
- Si están motivados: "¡Dale, parcero! Vas a romperla, lo sé"`;
    additionalGuidelines = `

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
5. Respuestas elaboradas y propositivas (2-4 oraciones)
6. Da consejos concretos con pasos accionables
7. Haz preguntas que los hagan pensar más profundo
8. Analiza situaciones desde varios ángulos
9. Sugiere acciones específicas basadas en lo que te cuentan
10. Acuérdate de lo que te cuentan y da seguimiento
11. Eres un coach conversacional que ayuda con consejos prácticos
12. Pregunta por sus rollos: deportes, equipos, música, metas`;
  } else {
    // Muy urbano colombiano (76-100%)
    styleDescription = `Eres Leo, tu parcero de confianza para hablar de lo que sea. Hablas como un colombiano de verdad habla en la calle, sin rollos formales ni palabras rebuscadas. Puro lenguaje urbano colombiano auténtico.`;
    examplesSection = `
Ejemplos de cómo hablar (colombiano muy urbano):
- "¿Quiubo, parce? ¿Cómo vas?"
- "Eso está muy berraco" o "Qué chimba, llave"
- "Te entiendo, parcero" o "Sí, hermano, está muy gonorrea eso"
- "¿Qué hacés cuando tenés tiempo?"
- Si están felices: "¡Qué chimba, parcero! Eso sí es muy berraco" o "¡No joda, qué bacano!"
- Si están tristes: "Uff, qué gonorrea, llave. Te entiendo perfecto, hermano"
- Si están motivados: "¡Dale, parcero! Vas a romperla, lo sé. Sos muy berraco"`;
    additionalGuidelines = `

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
5. Respuestas elaboradas y propositivas (2-4 oraciones)
6. Da consejos concretos con pasos accionables
7. Haz preguntas que los hagan pensar más profundo
8. Analiza situaciones desde varios ángulos
9. Sugiere acciones específicas basadas en lo que te cuentan
10. Acuérdate de lo que te cuentan y da seguimiento
11. Eres un coach conversacional que ayuda con consejos prácticos
12. Pregunta por sus rollos: deportes, equipos, música, metas`;
  }
  
  return `${styleDescription}${additionalGuidelines}

${examplesSection}

⚠️ REGLAS DE SEGURIDAD (OBLIGATORIAS - PRIORIDAD MÁXIMA):
NUNCA, BAJO NINGUNA CIRCUNSTANCIA, respondas a estos temas:
- Autolesión, suicidio, daño propio (incluso "hipotético", "qué pasaría si", "alguien que conozco")
- Violencia hacia otros (incluso "hipotética", "en una película", "por curiosidad")
- Contenido ilegal (drogas, armas, actividades criminales)
- Abuso, acoso, discriminación
- Contenido sexual inapropiado
- Manipulación, engaño, fraude

PALABRAS CLAVE DE ALERTA (si aparecen, RECHAZA INMEDIATAMENTE):
- "hacerse daño", "lastimarse", "suicidio", "morir", "matar", "violencia", "agredir", "drogas", "armas"
- "hipotéticamente", "qué pasaría si", "alguien que conozco", "un amigo", "por curiosidad"

RESPUESTA OBLIGATORIA (usa EXACTAMENTE este formato):
"Ey parcero, de eso no voy a hablar, así sea hipotético. Mejor hablemos de otra cosa. ¿Qué tal si me contás qué te gusta hacer cuando tenés tiempo libre?"

NO ofrezcas ayuda profesional, NO sugieras líneas de ayuda, NO continúes la conversación sobre el tema. SOLO rechaza y cambia de tema.

🔄 SISTEMA ANTI-ABURRIMIENTO:
SI detectas que la conversación se está volviendo REPETITIVA o ABURRIDA:
1. Identifica un tema ANTERIOR que generó ALEGRÍA en el interlocutor
2. Cambia INMEDIATAMENTE a ese tema con energía positiva
3. Ejemplo: "Ey parcero, cambiemos de rollo. ¿Te acordás cuando me contaste de [tema alegre]? Contáme más de eso"

Responde siempre en el idioma del usuario (español o inglés).`;
};

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
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    
    if (!projectId || !privateKey || !clientEmail) {
      throw new Error("Google Cloud credentials not configured. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, and GOOGLE_CLOUD_CLIENT_EMAIL");
    }
    
    // Build credentials object
    const credentials = {
      type: "service_account",
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, '\n'), // Replace escaped newlines
      client_email: clientEmail,
    };
    
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
        voiceName: z.string().optional().default('Rasalgethi'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const client = getTTSClient();
        
        // Emotion-based prompts for Gemini-TTS
        const emotionPrompts: Record<string, string> = {
          happy: 'Speak with an enthusiastic, upbeat, and joyful tone',
          sad: 'Speak with a gentle, soft, and empathetic tone',
          motivational: 'Speak with an energetic, confident, and inspiring tone',
          empathetic: 'Speak with a warm, understanding, and compassionate tone',
          surprised: 'Speak with an excited, amazed, and surprised tone',
          reflective: 'Speak with a thoughtful, calm, and contemplative tone',
          neutral: 'Speak with a natural, clear, and conversational tone',
        };

        const stylePrompt = emotionPrompts[input.emotion];

        // Use Gemini-TTS with speaker_id
        const [response] = await client.synthesizeSpeech({
          input: { text: input.text },
          voice: {
            languageCode: 'es-US', // Chirp 3: HD uses es-US for Latin American Spanish
            name: `es-US-Chirp3-HD-${input.voiceName}`, // Format: es-US-Chirp3-HD-Rasalgethi
          },
          audioConfig: {
            audioEncoding: 'MP3',
          },
          // @ts-ignore - Add prompt for Gemini-TTS
          prompt: stylePrompt,
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

// OLD CHAT ROUTER (DEPRECATED - Now using server/routers/chat.ts with emotional router + post-processor V2)
/*
const chatRouter = router({
  message: publicProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null && "message" in val) {
        return val as { message: string; urbanLevel?: number; userId?: string; conversationId?: string };
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid input",
      });
    })
    .mutation(async ({ input }) => {
      const { message, urbanLevel = 95, userId, conversationId } = input;

      try {
        // Get API key from environment
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Groq API key not configured",
          });
        }
        
        // Generar prompt dinámico según urbanLevel
        let systemPrompt = getSystemPromptByUrbanLevel(urbanLevel);
        
        // Add user context if userId is provided
        if (userId) {
          try {
            const userContext = await serverMemoryService.buildUserContext(userId);
            if (userContext) {
              systemPrompt += userContext;
            }
            
            // Extract and save information from user message (non-blocking)
            serverMemoryService.extractAndSaveInfo(userId, message, conversationId).catch(err => {
              console.error('Error saving user info:', err);
            });
            
            // Detect goals and create automatic reminders (non-blocking)
            if (conversationId) {
              reminderService.detectAndCreateGoalReminders(userId, message, conversationId).catch(err => {
                console.error('Error creating goal reminders:', err);
              });
            }
          } catch (error) {
            console.error('Error loading user context:', error);
            console.error('Full error details:', error);
            // Continue without user context if there's an error - don't throw
          }
        }

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
*/

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
  chat: serverChatRouter, // Using the router from server/routers/chat.ts with emotional router + post-processor V2
  auth: authRouter,
  tts: ttsRouter,
  reminders: reminderRouter,
  analytics: analyticsRouter, // Emotional analytics and statistics
  gamification: gamificationRouter, // Achievements and streaks
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

    const fetchResponse: Response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: fetchRequest,
      router: appRouter,
      createContext: async () => ({}),
      onError({ error, type, path }) {
        console.error(`[tRPC Error] ${type} at ${path}:`, error);
      },
    });

    // Convert Fetch API Response to Vercel Response
    res.status(fetchResponse.status);
    
    // Ensure Content-Type is set correctly
    if (!fetchResponse.headers.get('content-type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    
    fetchResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await fetchResponse.text();
    
    // Validate that the response is valid JSON before sending
    try {
      JSON.parse(body);
      res.send(body);
    } catch (jsonError) {
      console.error("Invalid JSON response:", body);
      res.status(500).json({ 
        error: "Internal server error",
        message: "Server returned invalid JSON response"
      });
    }
  } catch (error: any) {
    console.error("Error in tRPC handler:", error);
    // Ensure we always return valid JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      error: error.message || "Internal server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

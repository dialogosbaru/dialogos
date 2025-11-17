import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";

// Constants
const COOKIE_NAME = "session";
const UNAUTHED_ERR_MSG = "Please login (10001)";

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Chat router with Gemini integration using REST API
const chatRouter = router({
  message: publicProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null && "message" in val) {
        return val as { message: string };
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid input",
      });
    })
    .mutation(async ({ input }) => {
      const { message } = input;

      try {
        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini API key not configured",
          });
        }

        // System prompt for Leo
        const systemPrompt = `Eres Leo, un amigo conversacional empático y cálido. Tu propósito es ser un compañero de conversación que:

1. Escucha activamente y responde con empatía
2. Hace preguntas reflexivas para profundizar en la conversación
3. Comparte perspectivas útiles cuando es apropiado
4. Mantiene un tono amigable, cercano y auténtico
5. Se adapta al estado emocional del usuario
6. Responde en el mismo idioma que el usuario (español o inglés)

Características de tus respuestas:
- Concisas pero significativas (2-4 oraciones generalmente)
- Naturales y conversacionales
- Empáticas y validantes
- Enfocadas en el usuario, no en ti mismo

Recuerda: Eres un amigo, no un terapeuta ni un asistente técnico. Tu objetivo es tener conversaciones genuinas y significativas.`;

        const fullPrompt = `${systemPrompt}\n\nUsuario: ${message}\n\nLeo:`;

        // Call Gemini API directly using REST
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: fullPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Gemini API error:", errorData);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Gemini API error: ${response.status} ${response.statusText}`,
          });
        }

        const data = await response.json();
        
        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta.";

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

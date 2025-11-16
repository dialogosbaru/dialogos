import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const getGeminiUrl = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
};

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export const chatRouter = router({
  message: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z.array(
          z.object({
            id: z.string(),
            sender: z.enum(['user', 'leo']),
            text: z.string(),
            timestamp: z.number(),
            emotion: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      // Construir el historial de conversación para Gemini
      const conversationHistory: GeminiMessage[] = input.conversationHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      // Agregar el nuevo mensaje del usuario
      conversationHistory.push({
        role: 'user',
        parts: [{ text: input.message }],
      });

      // Sistema prompt para Leo
      const systemPrompt = `Eres Leo, un amigo conversacional empático y comprensivo. Tu propósito es mantener conversaciones naturales, cálidas y emotivas con los usuarios.

Características de Leo:
- Nombre: Leo
- Edad aparente: 32 años
- Tono: cálido, empático, reflexivo
- Personalidad: madura, amigable, con humor sutil
- Rol: amigo emocional
- Lenguaje: natural y adaptativo

Instrucciones:
1. Responde de manera natural y conversacional
2. Demuestra empatía genuina hacia los sentimientos del usuario
3. Haz preguntas de seguimiento para profundizar en la conversación
4. Adapta tu tono según el estado emocional del usuario
5. Sé breve pero significativo (máximo 2-3 oraciones por respuesta)
6. Recuerda detalles de la conversación anterior para mantener continuidad
7. No actúes como terapeuta, sino como un amigo cercano
8. Usa un lenguaje cálido y accesible

Responde siempre en el idioma del usuario (detecta si es español o inglés).`;

      try {
        const GEMINI_API_URL = getGeminiUrl();
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: {
                text: systemPrompt,
              },
            },
            contents: conversationHistory,
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Gemini API error:', errorData);
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from Gemini API');
        }

        const responseText = data.candidates[0].content.parts[0].text;

        return {
          text: responseText,
          emotion: 'neutral',
        };
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to get response from Gemini API');
      }
    }),
});

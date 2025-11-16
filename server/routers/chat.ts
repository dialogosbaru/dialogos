import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

// Inicializar el cliente de Gemini
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
};

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
        console.error('GEMINI_API_KEY is not configured');
        throw new Error('GEMINI_API_KEY is not configured');
      }

      try {
        const genAIClient = getGenAI();
        
        // Usar el modelo gemini-2.5-flash disponible en la API
        const model = genAIClient.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: `Eres Leo, un amigo conversacional empático y comprensivo. Tu propósito es mantener conversaciones naturales, cálidas y emotivas con los usuarios.

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

Responde siempre en el idioma del usuario (detecta si es español o inglés).`
        });

        // Construir el historial de conversación
        // Filtrar para asegurar que el primer mensaje sea del usuario (requerimiento de Gemini)
        let history: GeminiMessage[] = input.conversationHistory.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));
        
        // Si el historial comienza con un mensaje de 'model', removerlo
        while (history.length > 0 && history[0].role === 'model') {
          history.shift();
        }
        
        console.log('Conversation history length:', history.length);
        if (history.length > 0) {
          console.log('First message role:', history[0].role);
        }

        console.log('Starting chat session with Gemini (gemini-2.5-flash)...');
        
        // Iniciar una sesión de chat
        const chat = model.startChat({
          history: history,
        });

        console.log('Sending message to Gemini:', input.message);
        console.log('Using model: gemini-2.5-flash');
        
        // Enviar el mensaje
        const result = await chat.sendMessage(input.message);
        const responseText = result.response.text();

        console.log('Received response from Gemini successfully');
        console.log('Response preview:', responseText.substring(0, 100));

        return {
          text: responseText,
          emotion: 'neutral',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error calling Gemini API:', errorMessage);
        console.error('Full error:', error);
        throw new Error(`Failed to get response from Gemini API: ${errorMessage}`);
      }
    }),
});

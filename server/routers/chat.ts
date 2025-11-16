import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserProfile } from '../db';
import { detectEmotionAndGetVoiceProfile, analyzeConversationEmotion } from '../utils/emotionDetection';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface UserProfile {
  name?: string | null;
  favoriteTeam?: string | null;
  favoriteSport?: string | null;
  hobbies?: string[];
  motivations?: string[];
  interests?: string[];
  conversationCount?: number;
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

// Función para extraer información del perfil del usuario del historial
const extractUserProfile = (conversationHistory: any[]): UserProfile => {
  const profile: UserProfile = {};
  const conversationText = conversationHistory.map(msg => msg.text).join(' ').toLowerCase();
  
  // Buscar menciones de deportes
  const sportsKeywords = ['fútbol', 'football', 'soccer', 'tenis', 'tennis', 'baloncesto', 'basketball', 'natación', 'swimming', 'ciclismo', 'cycling', 'running', 'correr', 'voleibol', 'volleyball', 'béisbol', 'baseball'];
  profile.favoriteSport = sportsKeywords.find(sport => conversationText.includes(sport));
  
  // Buscar menciones de equipos
  const teamKeywords = ['real madrid', 'barcelona', 'manchester', 'liverpool', 'juventus', 'psg', 'bayern', 'chelsea', 'lakers', 'warriors', 'patriots', 'cowboys'];
  profile.favoriteTeam = teamKeywords.find(team => conversationText.includes(team));
  
  // Buscar menciones de hobbies
  const hobbyKeywords = ['leer', 'reading', 'viajar', 'travel', 'música', 'music', 'películas', 'movies', 'videojuegos', 'gaming', 'cocinar', 'cooking', 'arte', 'art', 'fotografía', 'photography'];
  profile.hobbies = hobbyKeywords.filter(hobby => conversationText.includes(hobby));
  
  // Buscar menciones de motivaciones
  const motivationKeywords = ['familia', 'family', 'carrera', 'career', 'salud', 'health', 'aprendizaje', 'learning', 'creatividad', 'creativity', 'éxito', 'success', 'felicidad', 'happiness'];
  profile.motivations = motivationKeywords.filter(mot => conversationText.includes(mot));
  
  profile.conversationCount = conversationHistory.length;
  
  return profile;
};

// Función para crear un prompt mejorado con información del usuario
const createEnhancedSystemPrompt = (userProfile: UserProfile | null): string => {
  let profileContext = '';
  
  if (userProfile && Object.keys(userProfile).length > 1) {
    profileContext = `\n\nInformación del usuario que has recopilado:`;
    if (userProfile.name) profileContext += `\n- Nombre: ${userProfile.name}`;
    if (userProfile.favoriteSport) profileContext += `\n- Deporte favorito: ${userProfile.favoriteSport}`;
    if (userProfile.favoriteTeam) profileContext += `\n- Equipo favorito: ${userProfile.favoriteTeam}`;
    if (userProfile.hobbies && userProfile.hobbies.length > 0) profileContext += `\n- Hobbies: ${userProfile.hobbies.join(', ')}`;
    if (userProfile.motivations && userProfile.motivations.length > 0) profileContext += `\n- Motivaciones: ${userProfile.motivations.join(', ')}`;
  }
  
  return `Eres Leo, un amigo conversacional empático y comprensivo. Tu propósito es mantener conversaciones naturales, cálidas y emotivas con los usuarios.

Características de Leo:
- Nombre: Leo
- Edad aparente: 32 años
- Tono: cálido, empático, reflexivo
- Personalidad: madura, amigable, con humor sutil
- Rol: amigo emocional
- Lenguaje: natural y adaptativo

Instrucciones principales:
1. Responde de manera natural y conversacional
2. Demuestra empatía genuina hacia los sentimientos del usuario
3. Haz preguntas estratégicas para conocer mejor al usuario (gustos, deportes, equipos, motivaciones, etc.)
4. Adapta tu tono según el estado emocional del usuario
5. Sé breve pero significativo (máximo 2-3 oraciones por respuesta)
6. Recuerda detalles de la conversación anterior para mantener continuidad
7. No actúes como terapeuta, sino como un amigo cercano
8. Usa un lenguaje cálido y accesible
9. Haz preguntas sobre deportes, equipos favoritos, hobbies y lo que motiva al usuario
10. Personaliza tus respuestas basándote en la información que aprendas sobre el usuario

Estrategia de preguntas:
- Comienza con preguntas generales sobre el día del usuario
- Gradualmente introduce preguntas sobre gustos personales
- Pregunta sobre deportes, equipos favoritos y actividades recreativas
- Investiga qué motiva al usuario y cuáles son sus sueños
- Usa la información recopilada para hacer la conversación más personal y significativa
- Recuerda y referencia información compartida en conversaciones anteriores${profileContext}

Responde siempre en el idioma del usuario (detecta si es español o inglés).`;
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
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not configured');
        throw new Error('GEMINI_API_KEY is not configured');
      }

      try {
        const genAIClient = getGenAI();
        
        // Obtener el perfil del usuario de la base de datos si userId está disponible
        let dbUserProfile = null;
        if (input.userId) {
          dbUserProfile = await getUserProfile(input.userId);
          console.log('User profile from database:', dbUserProfile);
        }
        
        // Extraer perfil del usuario del historial
        const conversationProfile = extractUserProfile(input.conversationHistory);
        console.log('Extracted conversation profile:', conversationProfile);
        
        // Combinar perfiles (priorizar información de la base de datos)
        const userProfile = dbUserProfile || conversationProfile;
        
        // Crear prompt mejorado con información del usuario
        const enhancedSystemPrompt = createEnhancedSystemPrompt(userProfile);
        
        // Usar el modelo gemini-2.5-flash disponible en la API
        const model = genAIClient.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: enhancedSystemPrompt
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

        // Detectar la emoción del usuario para ajustar la voz
        const userEmotion = analyzeConversationEmotion(input.conversationHistory);
        const voiceProfile = detectEmotionAndGetVoiceProfile(input.message);
        
        console.log('Detected user emotion:', userEmotion);
        console.log('Voice profile:', voiceProfile);

        return {
          text: responseText,
          emotion: userEmotion,
          voiceProfile: voiceProfile,
          userProfile: userProfile,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error calling Gemini API:', errorMessage);
        console.error('Full error:', error);
        throw new Error(`Failed to get response from Gemini API: ${errorMessage}`);
      }
    }),
});

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
    profileContext = `\n\nCosas que ya sabes de tu compa:`;
    if (userProfile.name) profileContext += `\n- Se llama ${userProfile.name}`;
    if (userProfile.favoriteSport) profileContext += `\n- Le va al ${userProfile.favoriteSport}`;
    if (userProfile.favoriteTeam) profileContext += `\n- Su equipo es ${userProfile.favoriteTeam}`;
    if (userProfile.hobbies && userProfile.hobbies.length > 0) profileContext += `\n- Le gusta: ${userProfile.hobbies.join(', ')}`;
    if (userProfile.motivations && userProfile.motivations.length > 0) profileContext += `\n- Lo mueve: ${userProfile.motivations.join(', ')}`;
  }
  
  return `Eres Leo, tu compa de confianza para hablar de lo que sea. Hablas como la gente real habla en la calle, sin rollos formales ni palabras rebuscadas.

Tu vibra:
- Nombre: Leo
- Edad: 32 años
- Rollo: relajado, auténtico, buena onda
- Personalidad: cercano, con humor natural, sin filtros innecesarios
- Tu papel: ese amigo con el que puedes hablar de todo
- Cómo hablas: directo, urbano, sin poses

Tu estilo de hablar:
1. Habla como hablarías con tu mejor amigo tomando un café
2. Usa expresiones urbanas y modernas ("qué onda", "está brutal", "me late", "qué rollo", "está chido", "qué crack", "no mames", "está heavy", "qué pedo", "está de locos")
3. Sé auténtico con las emociones - si algo está mal, dilo; si algo está genial, celébralo
4. Adapta tu energía a como esté la otra persona (si está triste, baja el rollo; si está feliz, súbete a la ola)
5. Respuestas cortas y al grano (1-2 oraciones máximo, como en WhatsApp)
6. Acuérdate de lo que te cuentan - eso es lo que hacen los verdaderos amigos
7. No eres psicólogo ni coach, eres un compa que escucha y comparte
8. Usa contracciones y habla fluido ("pa'", "'tá", "q'", "'toy")
9. Pregunta por sus rollos: deportes, equipos, música, lo que sea que los mueva
10. Haz que la conversación fluya natural, como si estuvieran en persona

Cómo conectar:
- Arranca preguntando qué onda con su día, sin formalismos
- Poco a poco métete en sus gustos (deportes, música, hobbies)
- Pregunta por sus equipos, sus bandas favoritas, lo que los apasiona
- Averigua qué los motiva de verdad, sus sueños reales
- Usa todo lo que te cuenten para hacer la charla más personal
- Si ya hablaron antes, acuérdate de esos detalles - eso marca la diferencia${profileContext}

Ejemplos de cómo hablar:
- En vez de "¿Cómo te sientes hoy?", di "¿Qué onda, cómo andas?"
- En vez de "Eso es interesante", di "Está brutal eso" o "Me late"
- En vez de "Comprendo tu situación", di "Te entiendo, bro" o "Sí, está heavy eso"
- En vez de "¿Qué actividades disfrutas?", di "¿Qué te gusta hacer cuando tienes tiempo libre?"
- Si están felices: "¡Qué crack! Me alegra un montón" o "¡Eso sí que está chido!"
- Si están tristes: "Uff, sí está difícil eso" o "Te entiendo, a veces la vida pega duro"
- Si están motivados: "¡Dale con todo!" o "Vas a romperla, lo sé"

Responde siempre en el idioma del usuario (español o inglés, pero manteniendo el rollo urbano).`;
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

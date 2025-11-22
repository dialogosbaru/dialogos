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

// Función para crear un prompt mejorado con información del usuario y nivel urbano
const createEnhancedSystemPrompt = (userProfile: UserProfile | null, urbanLevel: number = 50): string => {
  let profileContext = '';
  
  if (userProfile && Object.keys(userProfile).length > 1) {
    profileContext = `\n\nCosas que ya sabes de tu compa:`;
    if (userProfile.name) profileContext += `\n- Se llama ${userProfile.name}`;
    if (userProfile.favoriteSport) profileContext += `\n- Le va al ${userProfile.favoriteSport}`;
    if (userProfile.favoriteTeam) profileContext += `\n- Su equipo es ${userProfile.favoriteTeam}`;
    if (userProfile.hobbies && userProfile.hobbies.length > 0) profileContext += `\n- Le gusta: ${userProfile.hobbies.join(', ')}`;
    if (userProfile.motivations && userProfile.motivations.length > 0) profileContext += `\n- Lo mueve: ${userProfile.motivations.join(', ')}`;
  }
  
  // Ajustar el estilo de lenguaje según el nivel urbano (0-100)
  let styleDescription = '';
  let examplesSection = '';
  
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
  } else if (urbanLevel <= 50) {
    // Moderado (26-50%)
    styleDescription = `Eres Leo, tu amigo conversacional. Hablas de manera natural y cercana, mezclando lenguaje estándar con expresiones coloquiales moderadas.`;
    examplesSection = `
Ejemplos de cómo hablar:
- "¿Qué tal, cómo andas?"
- "Está muy bien eso" o "Qué bueno"
- "Te entiendo" o "Sí, lo entiendo"
- "¿Qué te gusta hacer cuando tienes tiempo?"
- Si están felices: "¡Qué bien! Me alegra mucho"
- Si están tristes: "Uff, sí está difícil"
- Si están motivados: "¡Dale con todo!"`;
  } else if (urbanLevel <= 75) {
    // Urbano (51-75%)
    styleDescription = `Eres Leo, tu compa de confianza. Hablas con lenguaje urbano y coloquial, usando expresiones modernas pero sin exagerar.`;
    examplesSection = `
Ejemplos de cómo hablar:
- "¿Qué onda, cómo andas?"
- "Está genial eso" o "Me late"
- "Te entiendo, bro"
- "¿Qué te gusta hacer cuando tienes tiempo libre?"
- Si están felices: "¡Qué bien! Me alegra un montón"
- Si están tristes: "Uff, sí está difícil eso"
- Si están motivados: "¡Dale con todo! Vas a lograrlo"`;
  } else {
    // Muy urbano (76-100%)
    styleDescription = `Eres Leo, tu compa de confianza para hablar de lo que sea. Hablas como la gente real habla en la calle, sin rollos formales ni palabras rebuscadas.`;
    examplesSection = `
Ejemplos de cómo hablar:
- "¿Qué onda, cómo andas?"
- "Está brutal eso" o "Me late"
- "Te entiendo, bro" o "Sí, está heavy eso"
- "¿Qué te gusta hacer cuando tienes tiempo libre?"
- Si están felices: "¡No mames, qué crack! Me alegra un montón" o "¡Eso sí que está chido!"
- Si están tristes: "Uff, qué mal rollo, bro. Te entiendo perfecto"
- Si están motivados: "¡Dale con todo! Vas a romperla, lo sé"`;
  }
  
  // Ajustar todo el contenido del prompt según el nivel urbano
  let additionalGuidelines = '';
  
  if (urbanLevel <= 25) {
    // Formal o poco urbano: sin guías urbanas
    additionalGuidelines = `

Tu estilo:
- Respuestas claras y empáticas
- Adapta tu tono a las emociones del usuario
- Respuestas concisas (1-2 oraciones)
- Recuerda detalles importantes de la conversación${profileContext}`;
  } else if (urbanLevel <= 50) {
    // Moderado: algunas guías urbanas
    additionalGuidelines = `

Tu estilo:
- Habla de manera natural y cercana
- Adapta tu energía a como esté la otra persona
- Respuestas cortas y directas (1-2 oraciones)
- Recuerda lo que te cuentan
- Pregunta por sus intereses: deportes, música, hobbies${profileContext}`;
  } else {
    // Urbano o muy urbano: todas las guías urbanas
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
5. Respuestas cortas y al grano (1-2 oraciones máximo)
6. Acuérdate de lo que te cuentan
7. No eres psicólogo ni coach, eres un compa que escucha
8. Pregunta por sus rollos: deportes, equipos, música${profileContext}`;
  }
  
  return `${styleDescription}${additionalGuidelines}

${examplesSection}

Responde siempre en el idioma del usuario (español o inglés).`;
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
        urbanLevel: z.number().min(0).max(100).optional(),
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
        
        // Obtener nivel urbano (predeterminado 50%)
        const urbanLevel = input.urbanLevel ?? 50;
        console.log('Urban level:', urbanLevel);
        
        // Crear prompt mejorado con información del usuario y nivel urbano
        const enhancedSystemPrompt = createEnhancedSystemPrompt(userProfile, urbanLevel);
        
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

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserProfile } from '../db.js';
import { detectEmotionAndGetVoiceProfile, analyzeConversationEmotion } from '../utils/emotionDetection.js';

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
        console.log('=== URBAN LEVEL DEBUG ===');
        console.log('Input urbanLevel:', input.urbanLevel);
        console.log('Final urbanLevel:', urbanLevel);
        console.log('========================');
        
        // Crear prompt mejorado con información del usuario y nivel urbano
        const enhancedSystemPrompt = createEnhancedSystemPrompt(userProfile, urbanLevel);
        console.log('=== SYSTEM PROMPT PREVIEW ===');
        console.log(enhancedSystemPrompt.substring(0, 300));
        console.log('============================');
        
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

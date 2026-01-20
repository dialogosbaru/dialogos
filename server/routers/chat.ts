import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { getUserProfile } from '../db.js';
import { detectEmotionAndGetVoiceProfile, analyzeConversationEmotion } from '../utils/emotionDetection.js';
import { serverMemoryService } from '../memoryService.js';
import { detectEmotionalState, calculateEmotionalRelevance, determineMemoryType } from '../emotionalDetection.js';
import { generateIntegratedPrompt } from '../prompts/integratedPrompt.js';
import { selectConversationalMode, getModeRules, getModeInstructions, validateResponse } from '../emotionalRouter.js';
import { postProcessResponse, validateProcessedResponse } from '../responsePostProcessor.js';
import { detectCrisis, getEmergencyResources } from '../crisisDetection.js';
import { logEmergencyActivation } from '../db_emergency.js';
import { logEmotionalState } from '../db_emotional_analytics.js';
import { updateUserStats, getRecentAchievements } from '../services/gamificationService.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

// Verificar que GROQ_API_KEY esté configurada
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not configured');
}

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
const createEnhancedSystemPrompt = (userProfile: UserProfile | null, urbanLevel: number = 50, userMemoryContext: string = ''): string => {
  let profileContext = '';
  
  if (userProfile && Object.keys(userProfile).length > 1) {
    profileContext = `\n\nCosas que ya sabes de tu compa:`;
    if (userProfile.name) profileContext += `\n- Se llama ${userProfile.name}`;
    if (userProfile.favoriteSport) profileContext += `\n- Le va al ${userProfile.favoriteSport}`;
    if (userProfile.favoriteTeam) profileContext += `\n- Su equipo es ${userProfile.favoriteTeam}`;
    if (userProfile.hobbies && userProfile.hobbies.length > 0) profileContext += `\n- Le gusta: ${userProfile.hobbies.join(', ')}`;
    if (userProfile.motivations && userProfile.motivations.length > 0) profileContext += `\n- Lo mueve: ${userProfile.motivations.join(', ')}`;
  }
  
  // Agregar memoria del usuario desde Supabase
  if (userMemoryContext) {
    profileContext += userMemoryContext;
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
            emotion: z.string().nullable().optional(), // Accept null from old frontend messages
          })
        ),
        userId: z.string().optional(),
        urbanLevel: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('\n\n==============================================');
      console.log('=== NEW CODE VERSION: Router + Post-Processor V2 ===');
      console.log('=== Commit: 1b4d3bb (CRITICAL FIX: Using Groq API) ===');
      console.log('==============================================\n');
      
      if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY is not configured');
        throw new Error('GROQ_API_KEY is not configured');
      }
      
      try {
        
        // Obtener memoria del usuario desde Supabase si userId está disponible
        let userMemoryContext = '';
        if (input.userId) {
          // Obtener memoria del usuario desde Supabase
          userMemoryContext = await serverMemoryService.buildUserContext(input.userId);
          console.log('User memory context from Supabase:', userMemoryContext);
        }
        
        // Extraer perfil del usuario del historial
        const conversationProfile = extractUserProfile(input.conversationHistory);
        console.log('Extracted conversation profile:', conversationProfile);
        
        // Usar perfil extraído de la conversación
        const userProfile = conversationProfile;
        
        // Obtener nivel urbano (predeterminado 50%)
        const urbanLevel = input.urbanLevel ?? 50;
        console.log('=== URBAN LEVEL DEBUG ===');
        console.log('Input urbanLevel:', input.urbanLevel);
        console.log('Final urbanLevel:', urbanLevel);
        console.log('========================');
        
        // CRISIS DETECTION: Check for high-risk language
        const crisisDetection = detectCrisis(input.message);
        console.log('=== CRISIS DETECTION ===');
        console.log('Detected:', crisisDetection.detected);
        if (crisisDetection.detected) {
          console.log('Severity:', crisisDetection.severity);
          console.log('Category:', crisisDetection.category);
          console.log('Matched:', crisisDetection.matchedText);
          console.log('Confidence:', crisisDetection.confidence);
          
          // Log activation to database
          await logEmergencyActivation({
            userId: input.userId || null,
            triggerPhrase: crisisDetection.matchedText || '',
            category: crisisDetection.category || 'unknown',
            severity: crisisDetection.severity || 'medium',
            confidence: Math.round((crisisDetection.confidence || 0) * 100),
            userMessage: input.message,
            responded: 0,
          });
        }
        console.log('========================');
        
        // Detectar estado emocional del mensaje del usuario
        const emotionalAnalysis = detectEmotionalState(input.message);
        console.log('=== EMOTIONAL ANALYSIS ===');
        console.log('State:', emotionalAnalysis.state);
        console.log('Intensity:', emotionalAnalysis.intensity);
        console.log('Needs containment:', emotionalAnalysis.needsContainment);
        console.log('Is exhausted:', emotionalAnalysis.isExhausted);
        console.log('Allow memory recall:', emotionalAnalysis.allowMemoryRecall);
        console.log('========================');
        
        // ROUTER EMOCIONAL: Seleccionar modo conversacional
        const conversationalMode = selectConversationalMode(emotionalAnalysis);
        const modeRules = getModeRules(conversationalMode);
        const modeInstructions = getModeInstructions(conversationalMode, modeRules);
        
        console.log('=== CONVERSATIONAL MODE ===');
        console.log('Mode selected:', conversationalMode);
        console.log('Max questions:', modeRules.maxQuestions);
        console.log('Allow advice:', modeRules.allowAdvice);
        console.log('Objective:', modeRules.objective);
        console.log('===========================');
        
        // ARQUITECTURA DE ROUTER: Decidir qué prompt usar
        let enhancedSystemPrompt: string;
        
        if (conversationalMode === 'CONTENCION') {
          // MODO CONTENCIÓN: Usar prompt de contención exclusivo (reemplaza el maestro V2)
          const { generateContencionPrompt } = await import('../prompts/contencionPrompt.js');
          enhancedSystemPrompt = generateContencionPrompt(urbanLevel);
          
          console.log('=== USING CONTENCIÓN PROMPT (EXCLUSIVE) ===');
          console.log('Master prompt V2 is REPLACED by contención prompt');
          console.log('===========================================');
        } else {
          // OTROS MODOS: Usar prompt maestro V2 con instrucciones del modo
          const basePrompt = generateIntegratedPrompt(
            urbanLevel,
            userProfile,
            emotionalAnalysis.allowMemoryRecall ? userMemoryContext : '', // Solo incluir memoria si el análisis lo permite
            emotionalAnalysis
          );
          
          // Agregar instrucciones del modo AL PRINCIPIO para máxima prioridad
          enhancedSystemPrompt = `${modeInstructions}

=== CONTEXTO E IDENTIDAD ===
${basePrompt}`;
          
          console.log('=== USING MASTER PROMPT V2 (with mode instructions) ===');
          console.log('Mode:', conversationalMode);
          console.log('========================================================');
        }
        console.log('=== SYSTEM PROMPT PREVIEW ===');
        console.log(enhancedSystemPrompt.substring(0, 500));
        console.log('=== FULL SYSTEM PROMPT ===');
        console.log(enhancedSystemPrompt);
        console.log('============================');
        
        // Construir el historial de conversación para Groq (formato OpenAI)
        const messages: ChatMessage[] = [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          ...input.conversationHistory.map((msg): ChatMessage => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          {
            role: 'user',
            content: input.message
          }
        ];
        
        console.log('Conversation history length:', messages.length - 2); // -2 para system y mensaje actual
        console.log('Sending message to Groq (llama-3.3-70b-versatile)...');
        
        // Llamar a Groq API (compatible con OpenAI)
        const response: Response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            temperature: 1.0,
            max_tokens: 500
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Groq API error:', errorData);
          throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        let responseText = data.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

        console.log('Received response from Groq successfully');
        console.log('Response preview:', responseText.substring(0, 100));
        
        // VALIDAR RESPUESTA según reglas del modo
        const validation = validateResponse(responseText, modeRules);
        console.log('=== RESPONSE VALIDATION ===');
        console.log('Valid:', validation.valid);
        if (!validation.valid) {
          console.log('Violations:', validation.violations);
          console.warn('⚠️ Response violates mode rules. Violations:', validation.violations.join(', '));
          
          // POST-PROCESAR: Eliminar violaciones automáticamente
          const postProcessed = postProcessResponse(responseText, modeRules);
          console.log('=== POST-PROCESSING ===');
          console.log('Modifications applied:', postProcessed.modificationsApplied);
          
          // Validar respuesta post-procesada
          const processedValidation = validateProcessedResponse(postProcessed.processedResponse);
          if (processedValidation.valid) {
            responseText = postProcessed.processedResponse;
            console.log('✅ Response corrected successfully');
          } else {
            console.error('❌ Post-processed response has issues:', processedValidation.issues);
            // Usar respuesta original si el post-procesamiento falla
          }
          console.log('=======================');
        }
        console.log('===========================');

        // Detectar la emoción del usuario para ajustar la voz
        const userEmotion = analyzeConversationEmotion(input.conversationHistory);
        const voiceProfile = detectEmotionAndGetVoiceProfile(input.message);
        
        console.log('Detected user emotion:', userEmotion);
        console.log('Voice profile:', voiceProfile);
        
        // Guardar memoria del usuario si userId está disponible y la relevancia es suficiente
        if (input.userId) {
          try {
            // Calcular relevancia emocional
            const relevance = calculateEmotionalRelevance(
              input.message,
              emotionalAnalysis,
              1 // Por ahora, repetitionCount = 1, se puede mejorar después
            );
            
            console.log('=== MEMORY SAVE ATTEMPT ===');
            console.log('Emotional relevance:', relevance);
            
            // Solo guardar si la relevancia es >= 0.3 (umbral)
            if (relevance >= 0.3) {
              const memoryType = determineMemoryType(input.message, emotionalAnalysis);
              
              // Nota: expires_at removido temporalmente hasta que se agregue la columna en producción
              // let expiresAt = null;
              // if (memoryType === 'contextual') {
              //   const expirationDate = new Date();
              //   expirationDate.setDate(expirationDate.getDate() + 7); // Caduca en 7 días
              //   expiresAt = expirationDate.toISOString();
              // }
              
              // Guardar en Supabase (sin metadata hasta que se agreguen las columnas en producción)
              await serverMemoryService.savePersonalInfo(
                input.userId,
                'other', // category (usar 'other' para conversaciones generales)
                `msg_${Date.now()}`, // key único
                input.message, // value
                relevance // confidence (usar relevancia como confidence)
                // sourceConversationId y metadata removidos temporalmente
              );
              
              console.log('Memory saved successfully');
              console.log('Memory type:', memoryType);
              console.log('Relevance:', relevance);
            } else {
              console.log('Memory not saved (relevance below threshold)');
            }
          } catch (memoryError) {
            console.error('Error saving memory:', memoryError);
            // No lanzar error, solo logear
          }
        }
        
        // Actualizar estadísticas de gamificación y obtener logros recientes
        let recentAchievements: any[] = [];
        if (input.userId) {
          try {
            await updateUserStats(parseInt(input.userId));
            console.log('[Gamification] User stats updated');
            
            // Obtener logros desbloqueados en los últimos 5 minutos
            const allAchievements = await getRecentAchievements(parseInt(input.userId));
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            recentAchievements = allAchievements.filter((a: any) => 
              new Date(a.unlockedAt).getTime() > fiveMinutesAgo
            );
            
            if (recentAchievements.length > 0) {
              console.log('[Gamification] Recent achievements unlocked:', recentAchievements.map((a: any) => a.title));
            }
          } catch (error) {
            console.error('[Gamification] Failed to update user stats:', error);
            // No lanzar error, solo logear
          }
        }
        
        // Registrar estado emocional en base de datos para análisis
        if (input.userId) {
          try {
            // Convertir intensity a número (0.0 - 1.0)
            const intensityValue = emotionalAnalysis.intensity === 'critical' ? 1.0 :
                                   emotionalAnalysis.intensity === 'high' ? 0.8 :
                                   emotionalAnalysis.intensity === 'medium' ? 0.5 :
                                   0.3; // low
            
            await logEmotionalState({
              userId: parseInt(input.userId),
              messagePreview: input.message.substring(0, 100),
              primaryEmotion: emotionalAnalysis.state,
              secondaryEmotions: JSON.stringify({
                needsContainment: emotionalAnalysis.needsContainment,
                needsValidation: emotionalAnalysis.needsValidation,
                isExhausted: emotionalAnalysis.isExhausted,
              }),
              intensity: intensityValue,
              // Calcular valence basado en el estado emocional
              valence: emotionalAnalysis.state === 'happy' || emotionalAnalysis.state === 'hopeful' ? 0.7 :
                       emotionalAnalysis.state === 'sad' || emotionalAnalysis.state === 'anxious' || emotionalAnalysis.state === 'frustrated' ? -0.7 :
                       emotionalAnalysis.state === 'crisis' ? -1.0 :
                       0.0, // neutral o tired
              conversationalMode: conversationalMode,
              crisisDetected: crisisDetection.detected ? 1 : 0,
              crisisCategory: crisisDetection.detected ? crisisDetection.category : null,
            });
          } catch (error) {
            console.error('[EmotionalAnalytics] Failed to log emotional state:', error);
            // No lanzar error, solo logear
          }
        }
        
        // Agregar reconocimiento de logros si hay logros recientes
        let finalResponse = responseText;
        if (recentAchievements.length > 0) {
          const achievementMessages = recentAchievements.map((a: any) => 
            `\n\n🎉 **${a.title}**: ${a.message}`
          ).join('');
          finalResponse = responseText + achievementMessages;
        }
        
        return {
          text: finalResponse,
          emotion: userEmotion,
          voiceProfile: voiceProfile,
          userProfile: userProfile,
          crisisDetected: crisisDetection.detected,
          crisisInfo: crisisDetection.detected ? {
            severity: crisisDetection.severity,
            category: crisisDetection.category,
            resources: getEmergencyResources(crisisDetection.category),
          } : null,
          recentAchievements: recentAchievements.length > 0 ? recentAchievements : null,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error calling Groq API:', errorMessage);
        console.error('Full error:', error);
        throw new Error(`Failed to get response from Groq API: ${errorMessage}`);
      }
    }),
});

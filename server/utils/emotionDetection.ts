/**
 * Sistema de detección de emociones y ajuste de voz mejorado
 * Analiza el texto del usuario para detectar su estado emocional
 * y ajusta los parámetros de voz de manera más natural y expresiva
 */

export type Emotion = 'happy' | 'sad' | 'anxious' | 'calm' | 'angry' | 'excited' | 'neutral';

export interface VoiceProfile {
  emotion: Emotion;
  rate: number; // 0.5 - 2.0 (velocidad de habla)
  pitch: number; // 0.5 - 2.0 (tono de voz)
  volume: number; // 0.0 - 1.0 (volumen)
  description: string;
}

// Perfiles de voz mejorados para cada emoción (más naturales y expresivos)
export const VOICE_PROFILES: Record<Emotion, VoiceProfile> = {
  happy: {
    emotion: 'happy',
    rate: 1.15, // Ligeramente más rápido, pero no exagerado
    pitch: 1.25, // Tono más alto pero natural
    volume: 0.95,
    description: 'Voz alegre, animada y optimista con energía positiva',
  },
  sad: {
    emotion: 'sad',
    rate: 0.75, // Más lento para transmitir empatía
    pitch: 0.85, // Tono más bajo y cálido
    volume: 0.75,
    description: 'Voz tranquila, empática y comprensiva con calidez',
  },
  anxious: {
    emotion: 'anxious',
    rate: 0.95, // Más lento para calmar
    pitch: 1.0, // Tono neutral y estable
    volume: 0.8,
    description: 'Voz calmante, tranquilizadora y estable',
  },
  calm: {
    emotion: 'calm',
    rate: 0.9, // Ritmo pausado y relajado
    pitch: 0.95, // Tono ligeramente bajo y sereno
    volume: 0.85,
    description: 'Voz serena, equilibrada y relajante',
  },
  angry: {
    emotion: 'angry',
    rate: 0.9, // Más lento para no escalar la situación
    pitch: 1.0, // Tono neutral
    volume: 0.8,
    description: 'Voz comprensiva, calmante y empática',
  },
  excited: {
    emotion: 'excited',
    rate: 1.25, // Más rápido con entusiasmo
    pitch: 1.35, // Tono más alto con energía
    volume: 1.0,
    description: 'Voz entusiasta, energética y contagiosa',
  },
  neutral: {
    emotion: 'neutral',
    rate: 1.0, // Velocidad normal
    pitch: 1.0, // Tono normal
    volume: 0.9,
    description: 'Voz natural, equilibrada y conversacional',
  },
};

// Palabras clave mejoradas con expresiones urbanas y coloquiales
const EMOTION_KEYWORDS: Record<Emotion, string[]> = {
  happy: [
    // Español formal
    'feliz', 'alegre', 'contento', 'bien', 'excelente', 'maravilloso', 'genial',
    'amor', 'adorar', 'encanta', 'perfecto',
    // Español urbano/coloquial
    'chido', 'chévere', 'brutal', 'crack', 'genial', 'de locos', 'increíble',
    'me late', 'está bueno', 'qué bueno', 'qué bien', 'súper', 'bacán',
    'está de puta madre', 'está chingón', 'está padrísimo', 'qué chulo',
    'me encanta', 'me fascina', 'me flipa', 'me mola', 'está guay',
    // Colombiano
    'chimba', 'qué chimba', 'bacano', 'berraco', 'qué berraco', 'parce',
    'parcero', 'llave', 'hermano', 'qué nota', 'qué bien parce', 'qué bacano',
    'está chimba', 'está bacano', 'está berraco', 'muy berraco', 'muy bacano',
    // English
    'happy', 'joyful', 'content', 'good', 'excellent', 'wonderful', 'great',
    'love', 'adore', 'love it', 'perfect', 'awesome', 'amazing', 'fantastic',
    'dope', 'lit', 'fire', 'sick', 'rad', 'cool beans',
  ],
  sad: [
    // Español formal
    'triste', 'deprimido', 'infeliz', 'mal', 'terrible', 'horrible', 'miserable',
    'llorar', 'lágrimas', 'dolor', 'sufrir', 'angustia', 'desesperado',
    // Español urbano/coloquial
    'bajón', 'de bajón', 'está heavy', 'está duro', 'está jodido', 'está difícil',
    'me siento mal', 'me siento de la chingada', 'estoy hecho mierda',
    'estoy para el arrastre', 'estoy que me lleva', 'no aguanto más',
    'qué gacho', 'qué feo', 'qué mal rollo', 'qué pena',
    // Colombiano
    'gonorrea', 'qué gonorrea', 'qué mal parce', 'está muy duro', 'está muy gonorrea',
    'qué maluco', 'qué feo parce', 'qué tristeza', 'me siento mal parce',
    'estoy mal hermano', 'qué vaina', 'qué vaina tan fea', 'está muy duro esto',
    // English
    'sad', 'depressed', 'unhappy', 'bad', 'awful', 'horrible', 'miserable',
    'cry', 'tears', 'pain', 'suffer', 'anguish', 'desperate', 'down',
    'bummed', 'blue', 'feeling down', 'rough', 'tough',
  ],
  anxious: [
    // Español formal
    'ansioso', 'nervioso', 'preocupado', 'asustado', 'miedo', 'pánico',
    'estrés', 'tenso', 'inquieto', 'agitado', 'intranquilo',
    // Español urbano/coloquial
    'estresado', 'estoy que me cargo', 'me estresa', 'me pone nervioso',
    'me da cosa', 'me da miedo', 'me asusta', 'qué nervios',
    'estoy cagado', 'estoy acojonado', 'me cago de miedo',
    'qué ansiedad', 'qué angustia', 'no puedo más',
    // English
    'anxious', 'nervous', 'worried', 'scared', 'fear', 'panic', 'stress',
    'tense', 'restless', 'agitated', 'uneasy', 'freaking out', 'stressed out',
    'on edge', 'jittery', 'wound up',
  ],
  calm: [
    // Español formal
    'tranquilo', 'sereno', 'pacífico', 'relajado', 'cómodo', 'seguro',
    'estable', 'equilibrado',
    // Español urbano/coloquial
    'relax', 'todo bien', 'todo tranqui', 'todo cool', 'todo chido',
    'estoy tranqui', 'estoy relajado', 'estoy en paz', 'todo bajo control',
    'sin estrés', 'sin broncas', 'sin rollos', 'todo suave',
    // English
    'calm', 'serene', 'peaceful', 'relaxed', 'comfortable', 'safe',
    'stable', 'balanced', 'chill', 'chilled out', 'laid back', 'zen',
    'at peace', 'mellow', 'easy going',
  ],
  angry: [
    // Español formal
    'enojado', 'furioso', 'irritado', 'molesto', 'rabia', 'ira',
    'frustrado', 'indignado',
    // Español urbano/coloquial
    'encabronado', 'emputa', 'me caga', 'me saca de quicio', 'me enfurece',
    'qué coraje', 'qué rabia', 'me hierve la sangre', 'estoy que exploto',
    'me tiene hasta la madre', 'me tiene hasta los huevos', 'me tiene harto',
    'qué bronca', 'qué pedo', 'qué onda', 'me da coraje',
    // English
    'angry', 'furious', 'irritated', 'annoyed', 'rage', 'wrath',
    'frustrated', 'indignant', 'pissed', 'pissed off', 'mad', 'livid',
    'fuming', 'heated', 'ticked off',
  ],
  excited: [
    // Español formal
    'emocionado', 'entusiasmado', 'eufórico', 'alucinante', 'increíble',
    'fascinante', 'emoción', 'adrenalina',
    // Español urbano/coloquial
    'está de locos', 'está brutal', 'está chingón', 'está de puta madre',
    'qué emoción', 'qué locura', 'no lo puedo creer', 'estoy que no quepo',
    'estoy que reviento', 'estoy súper emocionado', 'qué genial',
    'qué chido', 'qué bacán', 'qué crack', 'está de poca madre',
    // Colombiano
    'qué chimba parce', 'está muy berraco', 'qué nota', 'qué bacano parce',
    'estoy muy emocionado parce', 'qué locura hermano', 'no joda qué chimba',
    'está muy chimba', 'qué berraquera', 'qué vaina tan berraca',
    // English
    'excited', 'enthusiastic', 'euphoric', 'amazing', 'incredible',
    'fascinating', 'emotion', 'adrenaline', 'pumped', 'stoked', 'hyped',
    'psyched', 'thrilled', 'amped', 'fired up',
  ],
  neutral: [],
};

/**
 * Detecta la emoción del usuario basándose en el análisis del texto
 * Mejorado con mejor ponderación y contexto
 */
export function detectEmotion(text: string): Emotion {
  const lowerText = text.toLowerCase();
  let emotionScores: Record<Emotion, number> = {
    happy: 0,
    sad: 0,
    anxious: 0,
    calm: 0,
    angry: 0,
    excited: 0,
    neutral: 0,
  };

  // Contar palabras clave para cada emoción
  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        emotionScores[emotion as Emotion]++;
      }
    });
  });

  // Detectar signos de puntuación que indican emoción
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const capsCount = (text.match(/[A-Z]{2,}/g) || []).length;

  // Ajustar puntuaciones basándose en signos de puntuación
  if (exclamationCount > 0) {
    emotionScores.excited += exclamationCount * 0.5;
    emotionScores.happy += exclamationCount * 0.3;
  }
  if (questionCount > 1) {
    emotionScores.anxious += questionCount * 0.3;
  }
  if (capsCount > 0) {
    emotionScores.excited += capsCount * 0.4;
    emotionScores.angry += capsCount * 0.3;
  }

  // Encontrar la emoción con mayor puntuación
  let detectedEmotion: Emotion = 'neutral';
  let maxScore = 0;

  Object.entries(emotionScores).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as Emotion;
    }
  });

  // Si no se detectó ninguna emoción clara, usar neutral
  if (maxScore === 0) {
    detectedEmotion = 'neutral';
  }

  return detectedEmotion;
}

/**
 * Obtiene el perfil de voz para una emoción específica
 */
export function getVoiceProfile(emotion: Emotion): VoiceProfile {
  return VOICE_PROFILES[emotion] || VOICE_PROFILES.neutral;
}

/**
 * Detecta la emoción y retorna el perfil de voz correspondiente
 */
export function detectEmotionAndGetVoiceProfile(text: string): VoiceProfile {
  const emotion = detectEmotion(text);
  return getVoiceProfile(emotion);
}

/**
 * Analiza el historial de conversación para detectar la emoción general del usuario
 * Mejorado con ponderación de mensajes recientes
 */
export function analyzeConversationEmotion(conversationHistory: Array<{ sender: string; text: string }>): Emotion {
  // Obtener los últimos 5 mensajes del usuario (más contexto)
  const userMessages = conversationHistory
    .filter((msg) => msg.sender === 'user')
    .slice(-5)
    .map((msg) => msg.text);

  if (userMessages.length === 0) {
    return 'neutral';
  }

  // Ponderar más los mensajes recientes
  const weightedText = userMessages
    .map((text, index) => {
      const weight = index + 1; // Los mensajes más recientes tienen más peso
      return Array(weight).fill(text).join(' ');
    })
    .join(' ');

  return detectEmotion(weightedText);
}

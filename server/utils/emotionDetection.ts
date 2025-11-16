/**
 * Sistema de detección de emociones y ajuste de voz
 * Analiza el texto del usuario para detectar su estado emocional
 * y ajusta los parámetros de voz en consecuencia
 */

export type Emotion = 'happy' | 'sad' | 'anxious' | 'calm' | 'angry' | 'excited' | 'neutral';

export interface VoiceProfile {
  emotion: Emotion;
  rate: number; // 0.5 - 2.0 (velocidad de habla)
  pitch: number; // 0.5 - 2.0 (tono de voz)
  volume: number; // 0.0 - 1.0 (volumen)
  description: string;
}

// Perfiles de voz para cada emoción
export const VOICE_PROFILES: Record<Emotion, VoiceProfile> = {
  happy: {
    emotion: 'happy',
    rate: 1.2, // Un poco más rápido
    pitch: 1.3, // Tono más alto
    volume: 0.9,
    description: 'Voz alegre, animada y optimista',
  },
  sad: {
    emotion: 'sad',
    rate: 0.8, // Más lento
    pitch: 0.8, // Tono más bajo
    volume: 0.7,
    description: 'Voz tranquila, empática y comprensiva',
  },
  anxious: {
    emotion: 'anxious',
    rate: 1.1, // Ligeramente más rápido
    pitch: 1.1, // Tono ligeramente más alto
    volume: 0.8,
    description: 'Voz calmante y tranquilizadora',
  },
  calm: {
    emotion: 'calm',
    rate: 0.9, // Ligeramente más lento
    pitch: 0.95, // Tono neutral
    volume: 0.8,
    description: 'Voz serena y equilibrada',
  },
  angry: {
    emotion: 'angry',
    rate: 1.15, // Más rápido
    pitch: 1.2, // Tono más alto
    volume: 0.85,
    description: 'Voz comprensiva y calmante',
  },
  excited: {
    emotion: 'excited',
    rate: 1.3, // Más rápido
    pitch: 1.4, // Tono más alto
    volume: 1.0,
    description: 'Voz entusiasta y energética',
  },
  neutral: {
    emotion: 'neutral',
    rate: 1.0, // Normal
    pitch: 1.0, // Tono normal
    volume: 0.85,
    description: 'Voz natural y equilibrada',
  },
};

// Palabras clave para detectar emociones
const EMOTION_KEYWORDS: Record<Emotion, string[]> = {
  happy: [
    'feliz', 'happy', 'alegre', 'joyful', 'contento', 'content', 'bien', 'good',
    'excelente', 'excellent', 'maravilloso', 'wonderful', 'genial', 'great',
    'amor', 'love', 'adorar', 'adore', 'encanta', 'love it', 'perfecto', 'perfect',
  ],
  sad: [
    'triste', 'sad', 'deprimido', 'depressed', 'infeliz', 'unhappy', 'mal', 'bad',
    'terrible', 'awful', 'horrible', 'miserable', 'llorar', 'cry', 'lágrimas', 'tears',
    'dolor', 'pain', 'sufrir', 'suffer', 'angustia', 'anguish', 'desesperado', 'desperate',
  ],
  anxious: [
    'ansioso', 'anxious', 'nervioso', 'nervous', 'preocupado', 'worried', 'asustado', 'scared',
    'miedo', 'fear', 'pánico', 'panic', 'estrés', 'stress', 'tenso', 'tense',
    'inquieto', 'restless', 'agitado', 'agitated', 'intranquilo', 'uneasy',
  ],
  calm: [
    'tranquilo', 'calm', 'sereno', 'serene', 'pacífico', 'peaceful', 'relajado', 'relaxed',
    'cómodo', 'comfortable', 'seguro', 'safe', 'estable', 'stable', 'equilibrado', 'balanced',
  ],
  angry: [
    'enojado', 'angry', 'furioso', 'furious', 'irritado', 'irritated', 'molesto', 'annoyed',
    'rabia', 'rage', 'ira', 'wrath', 'frustrado', 'frustrated', 'indignado', 'indignant',
  ],
  excited: [
    'emocionado', 'excited', 'entusiasmado', 'enthusiastic', 'eufórico', 'euphoric',
    'alucinante', 'amazing', 'increíble', 'incredible', 'fascinante', 'fascinating',
    'emoción', 'emotion', 'adrenalina', 'adrenaline',
  ],
  neutral: [],
};

/**
 * Detecta la emoción del usuario basándose en el análisis del texto
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
 */
export function analyzeConversationEmotion(conversationHistory: Array<{ sender: string; text: string }>): Emotion {
  // Obtener los últimos 3 mensajes del usuario
  const userMessages = conversationHistory
    .filter((msg) => msg.sender === 'user')
    .slice(-3)
    .map((msg) => msg.text);

  if (userMessages.length === 0) {
    return 'neutral';
  }

  // Combinar los mensajes y detectar la emoción
  const combinedText = userMessages.join(' ');
  return detectEmotion(combinedText);
}

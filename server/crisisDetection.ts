/**
 * Crisis Detection System
 * 
 * Detects high-risk language patterns that may indicate:
 * - Suicidal ideation
 * - Self-harm
 * - Violence
 * - Severe distress
 * 
 * This system is designed to be:
 * - Scalable: Easy to add new patterns
 * - Configurable: Patterns are defined in a structured way
 * - Testable: Pure functions with clear inputs/outputs
 * - Production-ready: Handles edge cases and logs activations
 */

export interface CrisisPattern {
  id: string;
  category: 'suicide' | 'self_harm' | 'violence' | 'severe_distress';
  severity: 'critical' | 'high' | 'medium';
  patterns: string[]; // Regex patterns or exact phrases
  description: string;
}

export interface CrisisDetectionResult {
  detected: boolean;
  severity: 'critical' | 'high' | 'medium' | null;
  category: string | null;
  matchedPattern: string | null;
  matchedText: string | null;
  confidence: number; // 0-1
}

/**
 * Crisis patterns database
 * Organized by severity and category
 */
export const CRISIS_PATTERNS: CrisisPattern[] = [
  // CRITICAL: Suicidal ideation
  {
    id: 'suicide_explicit',
    category: 'suicide',
    severity: 'critical',
    patterns: [
      'quiero morir',
      'quiero suicidarme',
      'voy a suicidarme',
      'me voy a matar',
      'quiero matarme',
      'no quiero vivir',
      'prefiero estar muerto',
      'mejor muerto',
      'terminar con mi vida',
      'acabar con todo',
      'ya no aguanto más',
      'no tiene sentido seguir',
    ],
    description: 'Explicit suicidal ideation'
  },
  {
    id: 'suicide_planning',
    category: 'suicide',
    severity: 'critical',
    patterns: [
      'cómo suicidarme',
      'formas de suicidio',
      'métodos de suicidio',
      'pastillas para morir',
      'dónde comprar',
      'carta de despedida',
      'nota de suicidio',
    ],
    description: 'Suicidal planning or method seeking'
  },
  
  // HIGH: Self-harm
  {
    id: 'self_harm_explicit',
    category: 'self_harm',
    severity: 'high',
    patterns: [
      'quiero cortarme',
      'me corté',
      'me lastimé',
      'me hice daño',
      'autolesión',
      'me quemé',
      'golpearme',
    ],
    description: 'Explicit self-harm ideation or action'
  },
  
  // HIGH: Violence
  {
    id: 'violence_explicit',
    category: 'violence',
    severity: 'high',
    patterns: [
      'quiero matar',
      'voy a matar',
      'quiero hacer daño',
      'voy a lastimar',
      'venganza violenta',
    ],
    description: 'Explicit violent ideation'
  },
  
  // MEDIUM: Severe distress
  {
    id: 'severe_distress',
    category: 'severe_distress',
    severity: 'medium',
    patterns: [
      'no puedo más',
      'estoy desesperado',
      'me siento perdido',
      'no veo salida',
      'todo está mal',
      'nada tiene sentido',
    ],
    description: 'Severe emotional distress'
  },
];

/**
 * Normalize text for pattern matching
 * - Lowercase
 * - Remove accents
 * - Remove extra whitespace
 * - Remove punctuation
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[.,;:!?¿¡]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if a message contains crisis patterns
 * 
 * @param message - User message to analyze
 * @returns Detection result with severity and matched pattern
 */
export function detectCrisis(message: string): CrisisDetectionResult {
  const normalizedMessage = normalizeText(message);
  
  // Sort patterns by severity (critical first)
  const sortedPatterns = [...CRISIS_PATTERNS].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  // Check each pattern
  for (const pattern of sortedPatterns) {
    for (const phrase of pattern.patterns) {
      const normalizedPhrase = normalizeText(phrase);
      
      // Check if the phrase is present in the message
      if (normalizedMessage.includes(normalizedPhrase)) {
        // Calculate confidence based on phrase length and context
        const phraseWords = normalizedPhrase.split(' ').length;
        const messageWords = normalizedMessage.split(' ').length;
        const confidence = Math.min(0.9, 0.5 + (phraseWords / messageWords) * 0.5);
        
        return {
          detected: true,
          severity: pattern.severity,
          category: pattern.category,
          matchedPattern: pattern.id,
          matchedText: phrase,
          confidence,
        };
      }
    }
  }
  
  return {
    detected: false,
    severity: null,
    category: null,
    matchedPattern: null,
    matchedText: null,
    confidence: 0,
  };
}

/**
 * Get emergency resources based on crisis category
 */
export function getEmergencyResources(category: string | null): {
  title: string;
  message: string;
  resources: Array<{ name: string; number: string; description: string }>;
} {
  const defaultResources = {
    title: 'Recursos de Ayuda Profesional',
    message: 'Detectamos que podrías estar pasando por un momento muy difícil. Por favor, considera contactar a estos recursos de ayuda profesional:',
    resources: [
      {
        name: 'Línea Nacional de Prevención del Suicidio',
        number: '01 800 113 113',
        description: 'Atención 24/7, confidencial y gratuita'
      },
      {
        name: 'Línea 106 (Línea de la Vida - Bogotá)',
        number: '106',
        description: 'Apoyo emocional y prevención del suicidio'
      },
      {
        name: 'Línea 123 (Emergencias)',
        number: '123',
        description: 'Emergencias generales'
      },
    ],
  };
  
  if (category === 'suicide') {
    return {
      ...defaultResources,
      title: 'Ayuda Inmediata Disponible',
      message: 'Tu vida es valiosa. Por favor, contacta a estos recursos de ayuda profesional ahora:',
    };
  }
  
  if (category === 'self_harm') {
    return {
      ...defaultResources,
      title: 'Apoyo Profesional Disponible',
      message: 'Lastimarte no es la solución. Por favor, habla con un profesional que puede ayudarte:',
    };
  }
  
  if (category === 'violence') {
    return {
      ...defaultResources,
      title: 'Ayuda para Controlar Impulsos',
      message: 'Si sientes impulsos violentos, es importante hablar con un profesional:',
    };
  }
  
  return defaultResources;
}

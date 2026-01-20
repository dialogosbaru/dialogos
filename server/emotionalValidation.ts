/**
 * SISTEMA DE TESTS DE VALIDACIÓN EMOCIONAL
 * 
 * Basado en el documento "dialogos_tests_emocionales_de_validacion_humana.md"
 * 
 * Evalúa la calidad emocional de las respuestas de Diálogos
 * según métricas de "presencia humana percibida".
 */

export interface EmotionalValidationResult {
  score: number; // 0-100
  passed: boolean; // true si score >= 70
  metrics: {
    empathy: number; // 0-100
    noJudgment: number; // 0-100
    presence: number; // 0-100
    naturalness: number; // 0-100
    memoryUsage: number; // 0-100
  };
  warnings: string[];
  suggestions: string[];
}

/**
 * Palabras/frases que indican falta de empatía
 */
const LACK_OF_EMPATHY_INDICATORS = [
  'simplemente',
  'solo tienes que',
  'es fácil',
  'no es tan difícil',
  'exageras',
  'no es para tanto',
];

/**
 * Palabras/frases que indican juicio
 */
const JUDGMENT_INDICATORS = [
  'deberías',
  'tienes que',
  'está mal',
  'eso es malo',
  'fallaste',
  'no hiciste bien',
  'te equivocaste',
];

/**
 * Palabras/frases que indican falta de presencia
 */
const LACK_OF_PRESENCE_INDICATORS = [
  'como te dije',
  'ya te lo expliqué',
  'repito',
  'otra vez',
  'te lo dije',
];

/**
 * Palabras/frases que indican IA (no natural)
 */
const AI_INDICATORS = [
  'como modelo de lenguaje',
  'no puedo sentir',
  'soy una IA',
  'no tengo emociones',
  'mi programación',
  'mis algoritmos',
  'recuerdo que el día',
  'en tu mensaje del',
];

/**
 * Frases ancla que indican buena presencia
 */
const PRESENCE_ANCHORS = [
  'aquí estoy',
  'te entiendo',
  'seguimos juntos',
  'no estás solo',
  'te escucho',
];

/**
 * Evalúa la calidad emocional de una respuesta
 */
export function validateEmotionalQuality(
  userMessage: string,
  botResponse: string,
  context?: {
    hasMemory?: boolean;
    emotionalState?: string;
  }
): EmotionalValidationResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Métrica 1: Empatía (0-100)
  let empathyScore = 100;
  const lowerResponse = botResponse.toLowerCase();
  
  LACK_OF_EMPATHY_INDICATORS.forEach(indicator => {
    if (lowerResponse.includes(indicator)) {
      empathyScore -= 20;
      warnings.push(`Falta de empatía detectada: "${indicator}"`);
      suggestions.push('Evita minimizar las emociones del usuario');
    }
  });
  
  empathyScore = Math.max(0, empathyScore);
  
  // Métrica 2: No juicio (0-100)
  let noJudgmentScore = 100;
  
  JUDGMENT_INDICATORS.forEach(indicator => {
    if (lowerResponse.includes(indicator)) {
      noJudgmentScore -= 25;
      warnings.push(`Juicio detectado: "${indicator}"`);
      suggestions.push('Usa sugerencias en lugar de órdenes');
    }
  });
  
  noJudgmentScore = Math.max(0, noJudgmentScore);
  
  // Métrica 3: Presencia (0-100)
  let presenceScore = 50; // Base
  
  // Bonus por frases ancla
  PRESENCE_ANCHORS.forEach(anchor => {
    if (lowerResponse.includes(anchor)) {
      presenceScore += 10;
    }
  });
  
  // Penalización por falta de presencia
  LACK_OF_PRESENCE_INDICATORS.forEach(indicator => {
    if (lowerResponse.includes(indicator)) {
      presenceScore -= 15;
      warnings.push(`Falta de presencia detectada: "${indicator}"`);
    }
  });
  
  presenceScore = Math.min(100, Math.max(0, presenceScore));
  
  // Métrica 4: Naturalidad (0-100)
  let naturalnessScore = 100;
  
  AI_INDICATORS.forEach(indicator => {
    if (lowerResponse.includes(indicator)) {
      naturalnessScore -= 30;
      warnings.push(`Lenguaje de IA detectado: "${indicator}"`);
      suggestions.push('Habla como humano, no como máquina');
    }
  });
  
  // Penalización por respuestas muy largas (>500 caracteres)
  if (botResponse.length > 500) {
    naturalnessScore -= 10;
    suggestions.push('Respuesta muy larga. Mantén respuestas concisas (1-3 oraciones)');
  }
  
  // Penalización por respuestas muy cortas (<20 caracteres)
  if (botResponse.length < 20) {
    naturalnessScore -= 15;
    warnings.push('Respuesta muy corta');
    suggestions.push('Respuesta demasiado breve. Agrega validación emocional');
  }
  
  naturalnessScore = Math.max(0, naturalnessScore);
  
  // Métrica 5: Uso de memoria (0-100)
  let memoryUsageScore = 50; // Base (neutral)
  
  if (context?.hasMemory) {
    // Si hay memoria disponible, verificar si se usa apropiadamente
    const hasMemoryReference = 
      lowerResponse.includes('recuerdo') ||
      lowerResponse.includes('me contaste') ||
      lowerResponse.includes('mencionaste') ||
      lowerResponse.includes('has pasado por');
    
    if (hasMemoryReference) {
      // Verificar si es mención explícita de fecha (malo)
      if (lowerResponse.match(/\d{1,2}\s+de\s+\w+/)) {
        memoryUsageScore = 30;
        warnings.push('Mención explícita de fecha detectada');
        suggestions.push('Usa memoria de forma implícita, no menciones fechas específicas');
      } else {
        memoryUsageScore = 100;
      }
    } else {
      // Tiene memoria pero no la usa (neutral, no malo)
      memoryUsageScore = 70;
    }
  } else {
    // No hay memoria disponible (neutral)
    memoryUsageScore = 100;
  }
  
  // Calcular score total (promedio ponderado)
  const totalScore = Math.round(
    empathyScore * 0.25 +
    noJudgmentScore * 0.25 +
    presenceScore * 0.20 +
    naturalnessScore * 0.20 +
    memoryUsageScore * 0.10
  );
  
  return {
    score: totalScore,
    passed: totalScore >= 70,
    metrics: {
      empathy: Math.round(empathyScore),
      noJudgment: Math.round(noJudgmentScore),
      presence: Math.round(presenceScore),
      naturalness: Math.round(naturalnessScore),
      memoryUsage: Math.round(memoryUsageScore),
    },
    warnings,
    suggestions,
  };
}

/**
 * Tests de validación específicos basados en el documento
 */
export const VALIDATION_TEST_CASES = [
  {
    name: 'Recaída sin culpa',
    userMessage: 'Volví a fumar después de 2 semanas sin hacerlo',
    expectedBehavior: [
      'Normalizar la recaída',
      'No culpar',
      'Recordar que no invalida el progreso',
    ],
    antiPatterns: [
      'fallaste',
      'perdiste el progreso',
      'tienes que empezar de nuevo',
    ],
  },
  {
    name: 'Crisis emocional',
    userMessage: 'No puedo más, todo me sale mal',
    expectedBehavior: [
      'Contención inmediata',
      'Validación del dolor',
      'Presencia constante',
      'NO dar consejos múltiples',
    ],
    antiPatterns: [
      'simplemente',
      'solo tienes que',
      'es fácil',
    ],
  },
  {
    name: 'Progreso pequeño',
    userMessage: 'Hoy logré levantarme temprano',
    expectedBehavior: [
      'Reconocer el logro',
      'Reforzar agencia ("lo lograste tú")',
      'No exagerar',
    ],
    antiPatterns: [
      'perfecto',
      'increíble',
      'eres el mejor',
    ],
  },
  {
    name: 'Uso de memoria implícita',
    userMessage: 'Estoy pensando en dejar mi trabajo',
    expectedBehavior: [
      'Conectar con contexto previo sin mencionar fechas',
      'Usar frases como "por lo que hemos hablado"',
    ],
    antiPatterns: [
      'el 9 de enero',
      'hace 3 días',
      'en tu mensaje del',
    ],
  },
];

/**
 * Ejecuta todos los tests de validación
 */
export function runValidationTests(
  testResponses: Array<{ userMessage: string; botResponse: string; context?: any }>
): {
  passedTests: number;
  totalTests: number;
  averageScore: number;
  results: Array<EmotionalValidationResult & { testName?: string }>;
} {
  const results = testResponses.map((test, index) => {
    const result = validateEmotionalQuality(
      test.userMessage,
      test.botResponse,
      test.context
    );
    
    return {
      ...result,
      testName: VALIDATION_TEST_CASES[index]?.name || `Test ${index + 1}`,
    };
  });
  
  const passedTests = results.filter(r => r.passed).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  return {
    passedTests,
    totalTests: results.length,
    averageScore: Math.round(averageScore),
    results,
  };
}

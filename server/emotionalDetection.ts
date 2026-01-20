/**
 * SISTEMA DE DETECCIÓN DE ESTADO EMOCIONAL
 * 
 * Detecta el estado emocional del usuario para adaptar el tono
 * y la estructura de la respuesta según los principios de Diálogos.
 */

export type EmotionalState = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'frustrated'
  | 'crisis'
  | 'hopeful'
  | 'tired';

export type EmotionalIntensity = 'low' | 'medium' | 'high' | 'critical';

export interface EmotionalAnalysis {
  state: EmotionalState;
  intensity: EmotionalIntensity;
  needsContainment: boolean; // Priorizar contención sobre consejos
  needsValidation: boolean; // Necesita validación emocional explícita
  allowMemoryRecall: boolean; // Permitir traer recuerdos
  isExhausted: boolean; // Detecta frases de agotamiento (REGLA 2)
  suggestedTone: 'brief' | 'normal' | 'detailed'; // Longitud de respuesta
}

/**
 * Palabras clave para detectar estados emocionales
 */
/**
 * Frases que indican agotamiento emocional (REGLA 2)
 */
const EXHAUSTION_INDICATORS = [
  'ya he hecho de todo',
  'qué más se puede hacer',
  'ya no sé',
  'me cansé',
  'pero bueno',
  'da igual',
  'ya intenté todo',
  'nada funciona',
  'no sirve de nada',
  'para qué',
  'me rindo',
];

const EMOTIONAL_KEYWORDS = {
  crisis: [
    'no puedo más',
    'me quiero morir',
    'no tiene sentido',
    'estoy desesperado',
    'no aguanto',
    'me siento una carga',
    'quiero desaparecer',
  ],
  sad: [
    'triste',
    'deprimido',
    'solo',
    'vacío',
    'llorar',
    'mal',
    'cansado',
    'agotado',
  ],
  anxious: [
    'ansiedad',
    'nervioso',
    'preocupado',
    'miedo',
    'pánico',
    'angustia',
    'inquieto',
  ],
  frustrated: [
    'frustrado',
    'enojado',
    'molesto',
    'harto',
    'cansado de',
    'no funciona',
    'otra vez',
  ],
  happy: [
    'feliz',
    'contento',
    'alegre',
    'bien',
    'mejor',
    'logré',
    'conseguí',
  ],
  hopeful: [
    'espero',
    'quiero',
    'voy a',
    'intentaré',
    'meta',
    'objetivo',
  ],
  tired: [
    'cansado',
    'agotado',
    'sin energía',
    'exhausto',
    'rendido',
  ],
};

/**
 * Detecta el estado emocional del mensaje del usuario
 */
/**
 * Detecta si el mensaje contiene frases de agotamiento (REGLA 2)
 */
function detectExhaustion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return EXHAUSTION_INDICATORS.some(indicator => lowerMessage.includes(indicator));
}

export function detectEmotionalState(message: string): EmotionalAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Detectar agotamiento (REGLA 2)
  const isExhausted = detectExhaustion(message);
  
  // Detectar crisis (máxima prioridad)
  const hasCrisisKeywords = EMOTIONAL_KEYWORDS.crisis.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasCrisisKeywords) {
    return {
      state: 'crisis',
      intensity: 'critical',
      needsContainment: true,
      needsValidation: true,
      allowMemoryRecall: false, // NO traer memoria en crisis
      isExhausted: false, // Crisis es diferente de agotamiento
      suggestedTone: 'brief', // Respuestas breves y calmadas
    };
  }
  
  // Detectar otros estados
  let detectedState: EmotionalState = 'neutral';
  let maxMatches = 0;
  
  for (const [state, keywords] of Object.entries(EMOTIONAL_KEYWORDS)) {
    const matches = keywords.filter(keyword => 
      lowerMessage.includes(keyword)
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedState = state as EmotionalState;
    }
  }
  
  // Calcular intensidad basada en número de matches y signos de exclamación
  const exclamationCount = (message.match(/!/g) || []).length;
  const questionCount = (message.match(/\?/g) || []).length;
  
  let intensity: EmotionalIntensity = 'low';
  if (maxMatches >= 3 || exclamationCount >= 2) {
    intensity = 'high';
  } else if (maxMatches >= 2 || exclamationCount >= 1) {
    intensity = 'medium';
  }
  
  // Determinar necesidades según estado e intensidad
  const needsContainment = 
    ((detectedState === 'sad' || detectedState === 'anxious') && intensity !== 'low') ||
    isExhausted; // REGLA 2: Agotamiento activa contención
  
  const needsValidation = 
    (detectedState !== 'neutral' && detectedState !== 'happy') ||
    isExhausted;
  
  const allowMemoryRecall = 
    (!needsContainment || intensity === 'low') &&
    !isExhausted; // REGLA 2: No traer memoria si está agotado
  
  const suggestedTone = 
    needsContainment ? 'brief' : 
    detectedState === 'happy' ? 'normal' : 
    'normal';
  
  return {
    state: detectedState,
    intensity,
    needsContainment,
    needsValidation,
    allowMemoryRecall,
    isExhausted,
    suggestedTone,
  };
}

/**
 * Genera instrucciones adicionales para el prompt basadas en el análisis emocional
 */
export function getEmotionalInstructions(analysis: EmotionalAnalysis): string {
  let instructions = '';
  
  // MODO CONTENCIÓN por agotamiento (REGLA 2)
  if (analysis.isExhausted) {
    instructions += `
⚠️ MODO CONTENCIÓN ACTIVADO (agotamiento detectado)

El usuario muestra señales de agotamiento emocional.

NO HACER:
- Cambiar de tema (hobbies, distracciones)
- Ofrecer soluciones nuevas
- Derivar a médicos
- Animar con optimismo fácil

SÍ HACER:
- Quedarse con el dolor
- Normalizar el agotamiento
- Ofrecer descanso emocional
- Reforzar presencia constante

El usuario NO está pidiendo ideas nuevas. Está pidiendo descansar de luchar un rato.

Ejemplo de respuesta correcta:
"Eso que acabas de decir no es resignación cualquiera. Es agotamiento. Cuando uno llega a ese 'ya hice todo', no está pidiendo ideas nuevas… está pidiendo descansar de luchar un rato. No estás solo cargando esto. Quédate aquí un momento conmigo."
`;
  }
  
  if (analysis.needsContainment) {
    instructions += `
IMPORTANTE: El usuario está en un estado emocional vulnerable (${analysis.state}, intensidad ${analysis.intensity}).

PRIORIZA:
- Contención emocional antes que consejos
- Frases breves y calmadas
- Validación explícita de lo que siente
- Presencia constante

EVITA:
- Dar múltiples consejos
- Traer recuerdos del pasado
- Hacer muchas preguntas
- Respuestas largas
`;
  }
  
  if (analysis.state === 'crisis') {
    instructions += `
⚠️ ALERTA DE CRISIS EMOCIONAL

El usuario muestra señales de crisis. Tu respuesta debe:
1. Validar inmediatamente su dolor
2. Ofrecer presencia constante
3. Normalizar lo que siente
4. Si es apropiado, sugerir ayuda profesional con tacto
5. NO dramatizar ni minimizar

Usa frases como:
- "Aquí estoy contigo."
- "Esto no te define."
- "No es debilidad."
- "Tiene sentido que te sientas así."
`;
  }
  
  if (analysis.state === 'frustrated' && analysis.intensity === 'high') {
    instructions += `
El usuario está frustrado. Tu respuesta debe:
- Normalizar la frustración como parte del proceso
- NO dar consejos inmediatamente
- Validar que es difícil
- Recordar (si aplica) que los retrocesos no invalidan el progreso
`;
  }
  
  if (analysis.state === 'happy' || analysis.state === 'hopeful') {
    instructions += `
El usuario está en un estado positivo (${analysis.state}).

Tu respuesta debe:
- Reconocer la mejora sin exagerar
- Reforzar su agencia ("lo lograste tú")
- No generar euforia artificial
- Mantener esperanza realista
`;
  }
  
  if (!analysis.allowMemoryRecall) {
    instructions += `
⚠️ NO TRAER MEMORIA: El usuario está en un estado que no permite traer recuerdos del pasado. Enfócate en el presente y la contención.
`;
  }
  
  return instructions;
}

/**
 * Calcula la relevancia emocional de un mensaje para decidir si guardarlo en memoria
 * Fórmula: RELEVANCIA = IMPORTANCIA × REPETICIÓN × IMPACTO EMOCIONAL
 */
export function calculateEmotionalRelevance(
  message: string,
  analysis: EmotionalAnalysis,
  repetitionCount: number = 1
): number {
  // Importancia (0-1): basada en longitud y contenido
  const wordCount = message.split(/\s+/).length;
  const importance = Math.min(wordCount / 50, 1); // Máximo 1 para mensajes de 50+ palabras
  
  // Impacto emocional (0-1): basado en intensidad
  const impactMap: Record<EmotionalIntensity, number> = {
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    critical: 1.0,
  };
  const impact = impactMap[analysis.intensity];
  
  // Repetición (0-1): normalizada
  const repetition = Math.min(repetitionCount / 5, 1); // Máximo 1 para 5+ repeticiones
  
  // Fórmula final
  const relevance = importance * repetition * impact;
  
  return Math.min(relevance, 1);
}

/**
 * Determina el tipo de memoria según el contenido y análisis emocional
 */
export function determineMemoryType(
  message: string,
  analysis: EmotionalAnalysis
): 'identitaria' | 'proceso' | 'contextual' | 'vinculo' {
  const lowerMessage = message.toLowerCase();
  
  // Memoria identitaria: proyectos, condiciones médicas, objetivos vitales
  const identityKeywords = [
    'proyecto',
    'trabajo',
    'enfermedad',
    'diagnóstico',
    'siempre',
    'desde hace',
    'toda mi vida',
  ];
  
  if (identityKeywords.some(k => lowerMessage.includes(k))) {
    return 'identitaria';
  }
  
  // Memoria de proceso: cambios, evolución, metas
  const processKeywords = [
    'proceso',
    'cambio',
    'meta',
    'objetivo',
    'mejorar',
    'dejar de',
    'empezar a',
  ];
  
  if (processKeywords.some(k => lowerMessage.includes(k))) {
    return 'proceso';
  }
  
  // Memoria de vínculo: relación con la IA
  const bondKeywords = [
    'gracias',
    'me ayudas',
    'contigo',
    'aquí',
    'siempre',
  ];
  
  if (bondKeywords.some(k => lowerMessage.includes(k)) && analysis.state === 'happy') {
    return 'vinculo';
  }
  
  // Por defecto: contextual (corta duración)
  return 'contextual';
}

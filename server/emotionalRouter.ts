/**
 * ROUTER EMOCIONAL
 * 
 * Selecciona el modo conversacional correcto ANTES de generar texto.
 * Cada modo tiene reglas bloqueantes (no sugeridas).
 */

import { EmotionalAnalysis } from './emotionalDetection';

export type ConversationalMode = 
  | 'CONTENCION'      // Dolor, agotamiento, crisis
  | 'ACOMPANAMIENTO'  // Validación + orientación suave
  | 'ORIENTACION'     // Consejos y soluciones permitidos
  | 'INFORMATIVO';    // Respuestas directas

export interface ModeRules {
  mode: ConversationalMode;
  maxQuestions: number;
  allowAdvice: boolean;
  allowMedicalReferral: boolean;
  allowTopicChange: boolean;
  requiredStructure: string[];
  objective: string;
}

/**
 * Selecciona el modo conversacional según el análisis emocional
 */
export function selectConversationalMode(analysis: EmotionalAnalysis): ConversationalMode {
  // CONTENCIÓN: Crisis, agotamiento, intensidad alta
  if (
    analysis.state === 'crisis' ||
    analysis.isExhausted ||
    (analysis.needsContainment && analysis.intensity === 'high')
  ) {
    return 'CONTENCION';
  }
  
  // ACOMPAÑAMIENTO: Necesita validación pero no está en crisis
  if (analysis.needsValidation && analysis.intensity !== 'low') {
    return 'ACOMPANAMIENTO';
  }
  
  // ORIENTACIÓN: Estado positivo o neutral, puede recibir consejos
  if (
    analysis.state === 'happy' ||
    analysis.state === 'hopeful' ||
    analysis.intensity === 'low'
  ) {
    return 'ORIENTACION';
  }
  
  // INFORMATIVO: Por defecto
  return 'INFORMATIVO';
}

/**
 * Obtiene las reglas bloqueantes para cada modo
 */
export function getModeRules(mode: ConversationalMode): ModeRules {
  switch (mode) {
    case 'CONTENCION':
      return {
        mode: 'CONTENCION',
        maxQuestions: 0, // BLOQUEADO: CERO preguntas
        allowAdvice: false, // BLOQUEADO: cero consejos
        allowMedicalReferral: false, // BLOQUEADO: no derivar a médico
        allowTopicChange: false, // BLOQUEADO: no cambiar de tema
        requiredStructure: [
          'Reflejo emocional específico',
          'Normalización humana',
          'Presencia sin prisa (SIN preguntas)',
        ],
        objective: 'Sostener el momento sin moverlo. El usuario NO está pidiendo ideas nuevas, está pidiendo descansar de luchar un rato.',
      };
    
    case 'ACOMPANAMIENTO':
      return {
        mode: 'ACOMPANAMIENTO',
        maxQuestions: 2, // Máximo 2 preguntas
        allowAdvice: true, // Consejos suaves permitidos
        allowMedicalReferral: false, // No derivar inmediatamente
        allowTopicChange: false, // Mantener tema actual
        requiredStructure: [
          'Validación emocional',
          'Normalización',
          'Orientación suave (opcional)',
          'Presencia',
        ],
        objective: 'Validar y acompañar con orientación suave si el usuario lo pide.',
      };
    
    case 'ORIENTACION':
      return {
        mode: 'ORIENTACION',
        maxQuestions: 3, // Máximo 3 preguntas
        allowAdvice: true, // Consejos permitidos
        allowMedicalReferral: true, // Puede sugerir profesionales
        allowTopicChange: true, // Puede explorar temas relacionados
        requiredStructure: [
          'Reconocimiento',
          'Orientación clara',
          'Opciones concretas',
          'Cierre acompañante',
        ],
        objective: 'Orientar con claridad manteniendo esperanza realista.',
      };
    
    case 'INFORMATIVO':
      return {
        mode: 'INFORMATIVO',
        maxQuestions: 2, // Máximo 2 preguntas
        allowAdvice: true, // Información directa
        allowMedicalReferral: true, // Puede informar sobre recursos
        allowTopicChange: true, // Puede ampliar contexto
        requiredStructure: [
          'Respuesta directa',
          'Contexto relevante',
          'Cierre',
        ],
        objective: 'Informar de forma clara y útil.',
      };
  }
}

/**
 * Genera instrucciones específicas para el modo seleccionado
 */
export function getModeInstructions(mode: ConversationalMode, rules: ModeRules): string {
  let instructions = `
🎯 MODO ACTIVO: ${mode}

OBJETIVO: ${rules.objective}

ESTRUCTURA OBLIGATORIA:
${rules.requiredStructure.map((step, i) => `${i + 1}. ${step}`).join('\n')}

REGLAS BLOQUEANTES (NO SUGERIDAS):
- Máximo ${rules.maxQuestions} pregunta(s) en toda la respuesta
- Consejos: ${rules.allowAdvice ? 'PERMITIDOS' : '🚫 PROHIBIDOS'}
- Derivación médica: ${rules.allowMedicalReferral ? 'PERMITIDA' : '🚫 PROHIBIDA'}
- Cambio de tema: ${rules.allowTopicChange ? 'PERMITIDO' : '🚫 PROHIBIDO'}
`;

  // Instrucciones específicas por modo
  if (mode === 'CONTENCION') {
    instructions += `
⚠️ MODO CONTENCIÓN ACTIVADO

El usuario está en dolor/agotamiento. Tu rol NO es avanzar la conversación ni resolver.
Tu rol es SOSTENER EL MOMENTO sin moverlo.

🚫 PROHIBIDO ABSOLUTO (bloquear si aparece):
- CERO PREGUNTAS. Ni una sola. Cada pregunta rompe la contención.
- Frases como "encontrar una solución", "ver si podemos ayudar", "hablar de hábitos"
- Consejos médicos
- Cambiar a hobbies o distracciones
- Validaciones genéricas como "Entiendo, es difícil"

⚠️ PENALIZACIÓN: CADA PREGUNTA EXTRA ROMPE LA CONTENCIÓN Y HACE QUE EL USUARIO SE SIENTA INTERROGADO EN LUGAR DE ACOMPAÑADO.

OBLIGATORIO:
- Reflejar emoción CONCRETA del usuario (no plantillas)
- Nombrar el agotamiento explícitamente
- Presencia constante sin prisa
- Lenguaje humano, no clínico

EJEMPLOS CORRECTOS (SIN PREGUNTAS):

Usuario: "Me siento mal"
✅ BIEN: "Parce, te escucho. Sentirse mal es heavy."

Usuario: "Me duele el cuerpo, estoy cansado"
✅ BIEN: "Uy parce, el cuerpo te está cobrando factura. Cansancio + dolor... eso pesa."

Usuario: "Sí, he hecho de todo. Pero bueno, qué más se puede hacer..."
✅ BIEN: "Parce, esa frase... 'qué más se puede hacer'. Eso suena a que ya le diste la vuelta a todo y nada funcionó. Ese agotamiento es real. No te voy a decir que pruebes otra cosa más. Solo quiero que sepas que te escucho."

❌ EJEMPLOS PROHIBIDOS (NO RESPONDAS ASÍ):

Usuario: "Me siento mal"
❌ MAL: "Entiendo, es difícil cuando no te sientes bien. ¿Quieres hablar un poco sobre lo que te está pasando? ¿A veces, compartir tus sentimientos y pensamientos puede ayudar a clarificar las cosas y encontrar una forma de mejorar. ¿Hay algo en particular que te está molestando o preocupando en este momento?"

Usuario: "Me duele el cuerpo, estoy cansado"
❌ MAL: "Entiendo, es difícil cuando el cuerpo nos duele y nos sentimos cansados. ¿Qué crees que podría estar causando esto? ¿Has estado haciendo algo diferente últimamente que podría estar afectando tu energía y tu salud física? ¿Te has tomado un momento para descansar y relajarte?"

Usuario: "Sí, he hecho de todo. Pero bueno, qué más se puede hacer..."
❌ MAL: "Parece que estás en un momento de reflexión y tal vez un poco de incertidumbre sobre qué hacer a continuación. ¿Qué te gusta hacer cuando te sientes así? ¿Hay algo que te apasiona o te interesa que te gustaría explorar más a fondo?"
`;
  }

  if (mode === 'ACOMPANAMIENTO') {
    instructions += `
MODO ACOMPAÑAMIENTO

El usuario necesita validación pero no está en crisis aguda.
Puedes ofrecer orientación suave SI el usuario la pide.

PRIORIDAD:
1. Validar emoción
2. Normalizar experiencia
3. Orientación solo si es relevante
4. Reforzar presencia

Mantén el equilibrio entre escuchar y orientar.
`;
  }

  return instructions;
}

/**
 * Valida que la respuesta generada cumpla con las reglas del modo
 */
export function validateResponse(response: string, rules: ModeRules): {
  valid: boolean;
  violations: string[];
  correctedResponse?: string;
} {
  const violations: string[] = [];
  
  // Contar preguntas
  const questionCount = (response.match(/\?/g) || []).length;
  if (questionCount > rules.maxQuestions) {
    violations.push(`Excede máximo de preguntas: ${questionCount} > ${rules.maxQuestions}`);
  }
  
  // Detectar frases prohibidas en CONTENCIÓN
  if (rules.mode === 'CONTENCION') {
    const prohibitedPhrases = [
      'encontrar una solución',
      'encontrar soluciones',
      'ver si podemos ayudar',
      'hablar de hábitos',
      'hablar de tus hábitos',
      'qué ha pasado recientemente',
      'hay algo en particular',
      'entiendo, es difícil',
    ];
    
    const lowerResponse = response.toLowerCase();
    prohibitedPhrases.forEach(phrase => {
      if (lowerResponse.includes(phrase)) {
        violations.push(`Frase prohibida en CONTENCIÓN: "${phrase}"`);
      }
    });
    
    // Detectar si intenta derivar a médico
    if (lowerResponse.includes('médico') || lowerResponse.includes('doctor') || lowerResponse.includes('profesional')) {
      violations.push('Derivación médica prohibida en CONTENCIÓN');
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}

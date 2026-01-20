/**
 * POST-PROCESADOR DE RESPUESTAS V2
 * 
 * Elimina automáticamente preguntas extras cuando el LLM viola las reglas del modo.
 * Versión mejorada que cuenta preguntas por signos "?" en lugar de por oraciones.
 */

import { ModeRules } from './emotionalRouter';

/**
 * Cuenta el número de preguntas en el texto (por signos "?")
 */
function countQuestions(text: string): number {
  return (text.match(/\?/g) || []).length;
}

/**
 * Elimina preguntas extras del texto, manteniendo solo las primeras N preguntas permitidas
 */
function removeExtraQuestions(text: string, maxQuestions: number): {
  processedText: string;
  removedQuestions: string[];
} {
  const removedQuestions: string[] = [];
  
  // Si no hay preguntas permitidas, eliminar TODAS las preguntas
  if (maxQuestions === 0) {
    // Dividir por "?" y eliminar todas las preguntas
    const parts = text.split('?');
    
    // Guardar las preguntas eliminadas
    for (let i = 0; i < parts.length - 1; i++) {
      // Buscar el inicio de la pregunta (desde el último punto/exclamación o desde el inicio)
      const part = parts[i];
      const lastPunctuation = Math.max(
        part.lastIndexOf('.'),
        part.lastIndexOf('!'),
        part.lastIndexOf('\n')
      );
      
      const questionStart = lastPunctuation >= 0 ? lastPunctuation + 1 : 0;
      const question = part.substring(questionStart).trim();
      if (question.length > 0) {
        removedQuestions.push(question + '?');
      }
    }
    
    // Reconstruir el texto sin preguntas
    let result = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i === parts.length - 1) {
        // Última parte (después de la última pregunta o texto sin preguntas)
        result += part;
      } else {
        // Eliminar la pregunta pero mantener el texto antes de ella
        const lastPunctuation = Math.max(
          part.lastIndexOf('.'),
          part.lastIndexOf('!'),
          part.lastIndexOf('\n')
        );
        
        if (lastPunctuation >= 0) {
          result += part.substring(0, lastPunctuation + 1) + ' ';
        } else {
          // Si no hay puntuación previa, mantener el texto pero agregar punto
          if (part.trim().length > 0) {
            result += part.trim() + '. ';
          }
        }
      }
    }
    
    return {
      processedText: result.trim(),
      removedQuestions,
    };
  }
  
  // Si hay preguntas permitidas, mantener solo las primeras N
  const parts = text.split('?');
  let questionsKept = 0;
  let result = '';
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (i === parts.length - 1) {
      // Última parte (después de la última pregunta o texto sin preguntas)
      result += part;
    } else {
      // Hay una pregunta aquí
      if (questionsKept < maxQuestions) {
        // Mantener esta pregunta
        result += part + '?';
        questionsKept++;
      } else {
        // Eliminar esta pregunta
        const lastPunctuation = Math.max(
          part.lastIndexOf('.'),
          part.lastIndexOf('!'),
          part.lastIndexOf('\n')
        );
        
        const questionStart = lastPunctuation >= 0 ? lastPunctuation + 1 : 0;
        const question = part.substring(questionStart).trim();
        if (question.length > 0) {
          removedQuestions.push(question + '?');
        }
        
        if (lastPunctuation >= 0) {
          result += part.substring(0, lastPunctuation + 1) + ' ';
        } else {
          if (part.trim().length > 0) {
            result += part.trim() + '. ';
          }
        }
      }
    }
  }
  
  return {
    processedText: result.trim(),
    removedQuestions,
  };
}

/**
 * Post-procesa la respuesta para eliminar preguntas extras
 */
export function postProcessResponse(response: string, rules: ModeRules): {
  processedResponse: string;
  modificationsApplied: string[];
} {
  const modifications: string[] = [];
  
  // Contar preguntas
  const questionCount = countQuestions(response);
  
  console.log('=== POST-PROCESSOR DEBUG ===');
  console.log('Question count:', questionCount);
  console.log('Max questions allowed:', rules.maxQuestions);
  console.log('===========================');
  
  let processedResponse = response;
  
  if (questionCount > rules.maxQuestions) {
    // Eliminar preguntas extras
    const result = removeExtraQuestions(response, rules.maxQuestions);
    processedResponse = result.processedText;
    
    result.removedQuestions.forEach(q => {
      modifications.push(`Eliminada pregunta extra: "${q.substring(0, 50)}${q.length > 50 ? '...' : ''}"`);
    });
    
    console.log('=== QUESTIONS REMOVED ===');
    console.log('Count:', result.removedQuestions.length);
    result.removedQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q}`);
    });
    console.log('=========================');
  }
  
  // Eliminar frases prohibidas en CONTENCIÓN
  if (rules.mode === 'CONTENCION') {
    processedResponse = removeProhibitedPhrases(processedResponse, modifications);
  }
  
  return {
    processedResponse,
    modificationsApplied: modifications,
  };
}

/**
 * Elimina frases prohibidas en modo CONTENCIÓN
 */
function removeProhibitedPhrases(text: string, modifications: string[]): string {
  let result = text;
  
  const prohibitedPhrases = [
    { phrase: 'encontrar una solución', replacement: 'estar aquí contigo' },
    { phrase: 'encontrar soluciones', replacement: 'acompañarte' },
    { phrase: 'ver si podemos ayudar', replacement: 'escucharte' },
    { phrase: 'hablar de hábitos', replacement: 'quedarnos aquí un momento' },
    { phrase: 'hablar de tus hábitos', replacement: 'quedarnos aquí un momento' },
    { phrase: 'Entiendo, es difícil', replacement: 'Te escucho' },
    { phrase: 'buscar formas de aliviar', replacement: 'estar contigo' },
    { phrase: 'identificar juntos posibles causas', replacement: 'escucharte' },
  ];
  
  prohibitedPhrases.forEach(({ phrase, replacement }) => {
    const regex = new RegExp(phrase, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, replacement);
      modifications.push(`Reemplazada frase prohibida: "${phrase}" → "${replacement}"`);
    }
  });
  
  // Eliminar derivación médica
  const medicalReferrals = [
    { regex: /consulta(r)? (con )?un médico/gi, replacement: 'toma tu tiempo' },
    { regex: /habla(r)? (con )?un doctor/gi, replacement: 'descansa' },
    { regex: /busca(r)? ayuda profesional/gi, replacement: 'cuídate' },
    { regex: /ve(r)? (a )?un especialista/gi, replacement: 'toma tu tiempo' },
  ];
  
  medicalReferrals.forEach(({ regex, replacement }) => {
    if (regex.test(result)) {
      result = result.replace(regex, replacement);
      modifications.push('Eliminada derivación médica');
    }
  });
  
  return result;
}

/**
 * Valida que la respuesta post-procesada sea coherente
 */
export function validateProcessedResponse(response: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Verificar que no esté vacía
  if (response.trim().length === 0) {
    issues.push('Respuesta vacía después del post-procesamiento');
  }
  
  // Verificar que no termine abruptamente
  if (!response.trim().match(/[.!?]$/)) {
    issues.push('Respuesta no termina con puntuación adecuada');
  }
  
  // Verificar que tenga al menos 20 caracteres
  if (response.trim().length < 20) {
    issues.push('Respuesta demasiado corta después del post-procesamiento');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

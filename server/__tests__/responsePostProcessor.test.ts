import { describe, it, expect } from 'vitest';
import { postProcessResponse } from '../responsePostProcessor.js';
import { ModeRules } from '../emotionalRouter.js';

describe('Response Post-Processor V2 - Eliminación de preguntas múltiples', () => {
  
  it('debe eliminar TODAS las preguntas cuando maxQuestions = 0', () => {
    const response = 'Entiendo, es difícil cuando nos duele el cuerpo y también nos afecta el estado de ánimo. ¿Qué crees que podría estar causando el dolor en tus rodillas? ¿Has hecho algo diferente últimamente o has notado algún patrón en cuanto al dolor? ¿Te gustaría hablar un poco más sobre lo que te está pasando y cómo te sientes?';
    
    const rules: ModeRules = {
      mode: 'CONTENCION',
      maxQuestions: 0,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'sostener',
      structure: 'Presencia sin prisa (SIN preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Verificar que no hay preguntas en la respuesta procesada
    expect(result.processedResponse).not.toContain('?');
    
    // Verificar que se eliminaron 3 preguntas
    expect(result.modificationsApplied.length).toBeGreaterThanOrEqual(3);
    
    // Verificar que la respuesta mantiene el contenido no-pregunta
    // Nota: "Entiendo, es difícil" se reemplaza por "Te escucho" (frase prohibida)
    expect(result.processedResponse).toContain('Te escucho');
    expect(result.processedResponse.toLowerCase()).toContain('duele');
  });

  it('debe mantener solo 1 pregunta cuando maxQuestions = 1', () => {
    const response = 'Te escucho. ¿Cómo te sientes? ¿Qué pasó? ¿Quieres hablar de eso?';
    
    const rules: ModeRules = {
      mode: 'ACOMPAÑAMIENTO',
      maxQuestions: 1,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'validar y orientar',
      structure: 'Validación + orientación suave (máx 2 preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Contar preguntas en la respuesta procesada
    const questionCount = (result.processedResponse.match(/\?/g) || []).length;
    expect(questionCount).toBe(1);
    
    // Verificar que se eliminaron 2 preguntas
    expect(result.modificationsApplied.length).toBe(2);
  });

  it('debe mantener 2 preguntas cuando maxQuestions = 2', () => {
    const response = 'Entiendo. ¿Cómo te sientes? ¿Qué pasó? ¿Quieres hablar de eso?';
    
    const rules: ModeRules = {
      mode: 'ACOMPAÑAMIENTO',
      maxQuestions: 2,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'validar y orientar',
      structure: 'Validación + orientación suave (máx 2 preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Contar preguntas en la respuesta procesada
    const questionCount = (result.processedResponse.match(/\?/g) || []).length;
    expect(questionCount).toBe(2);
    
    // Verificar que se eliminó 1 pregunta
    expect(result.modificationsApplied.length).toBe(1);
  });

  it('debe eliminar preguntas del ejemplo real del usuario', () => {
    const response = 'Entiendo, es difícil cuando nos duele el cuerpo y también nos afecta el estado de ánimo. ¿Qué crees que podría estar causando el dolor en tus rodillas? ¿Has hecho algo diferente últimamente o has notado algún patrón en cuanto al dolor? ¿Te gustaría hablar un poco más sobre lo que te está pasando y cómo te sientes?';
    
    const rules: ModeRules = {
      mode: 'CONTENCION',
      maxQuestions: 0,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'sostener',
      structure: 'Presencia sin prisa (SIN preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Verificar que NO hay preguntas
    expect(result.processedResponse).not.toContain('?');
    
    // Verificar que mantiene contenido emocional
    // Nota: "Entiendo, es difícil" se reemplaza por "Te escucho" (frase prohibida)
    expect(result.processedResponse.toLowerCase()).toContain('duele');
    
    // Verificar que se registraron las modificaciones
    expect(result.modificationsApplied.length).toBeGreaterThan(0);
  });

  it('debe reemplazar frases prohibidas en modo CONTENCIÓN', () => {
    const response = 'Entiendo, es difícil. Vamos a encontrar una solución juntos.';
    
    const rules: ModeRules = {
      mode: 'CONTENCION',
      maxQuestions: 0,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'sostener',
      structure: 'Presencia sin prisa (SIN preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Verificar que se reemplazó la frase prohibida
    expect(result.processedResponse).not.toContain('encontrar una solución');
    expect(result.processedResponse).toContain('estar aquí contigo');
    
    // Verificar que se registró la modificación
    expect(result.modificationsApplied.some(m => m.includes('frase prohibida'))).toBe(true);
  });

  it('debe eliminar derivación médica en modo CONTENCIÓN', () => {
    const response = 'Te escucho. Deberías consultar con un médico sobre ese dolor.';
    
    const rules: ModeRules = {
      mode: 'CONTENCION',
      maxQuestions: 0,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'sostener',
      structure: 'Presencia sin prisa (SIN preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Verificar que se eliminó la derivación médica
    expect(result.processedResponse.toLowerCase()).not.toContain('médico');
    expect(result.processedResponse.toLowerCase()).not.toContain('doctor');
    
    // Verificar que se registró la modificación
    expect(result.modificationsApplied.some(m => m.includes('derivación médica'))).toBe(true);
  });

  it('no debe modificar respuestas que cumplen las reglas', () => {
    const response = 'Te escucho. Sentirse así es válido. Aquí estoy contigo.';
    
    const rules: ModeRules = {
      mode: 'CONTENCION',
      maxQuestions: 0,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'sostener',
      structure: 'Presencia sin prisa (SIN preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Verificar que la respuesta no cambió
    expect(result.processedResponse).toBe(response);
    
    // Verificar que no se aplicaron modificaciones
    expect(result.modificationsApplied.length).toBe(0);
  });

  it('debe mantener coherencia después de eliminar preguntas', () => {
    const response = 'Hola. ¿Cómo estás? Te escucho. ¿Qué pasó? Estoy aquí. ¿Quieres hablar?';
    
    const rules: ModeRules = {
      mode: 'CONTENCION',
      maxQuestions: 0,
      allowAdvice: false,
      allowTopicChange: false,
      objective: 'sostener',
      structure: 'Presencia sin prisa (SIN preguntas)',
    };
    
    const result = postProcessResponse(response, rules);
    
    // Verificar que no hay preguntas
    expect(result.processedResponse).not.toContain('?');
    
    // Verificar que mantiene contenido no-pregunta
    expect(result.processedResponse).toContain('Hola');
    expect(result.processedResponse).toContain('Te escucho');
    expect(result.processedResponse).toContain('Estoy aquí');
    
    // Verificar que termina con puntuación
    expect(result.processedResponse).toMatch(/[.!]$/);
  });
});

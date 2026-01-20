import { describe, it, expect } from 'vitest';
import { generateIntegratedPrompt } from '../integratedPrompt.js';

describe('Master Prompt V2 - Reducción de preguntas y presencia emocional', () => {
  
  it('debe incluir el nuevo prompt maestro V2 en el prompt integrado', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar que incluye elementos clave del nuevo prompt V2
    expect(prompt).toContain('Leo');
    expect(prompt).toContain('IDENTIDAD Y PROPÓSITO');
    expect(prompt.toLowerCase()).toContain('acompañar');
    expect(prompt.toLowerCase()).toContain('escuchar');
    expect(prompt.toLowerCase()).toContain('presencia');
  });

  it('debe incluir las 5 reglas técnicas en el prompt', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar que incluye las 5 reglas técnicas
    expect(prompt).toContain('REGLAS TÉCNICAS');
    expect(prompt).toContain('REGLA 1');
    expect(prompt).toContain('REGLA 2');
    expect(prompt).toContain('REGLA 3');
    expect(prompt).toContain('REGLA 4');
    expect(prompt).toContain('REGLA 5');
  });

  it('debe incluir instrucciones sobre estructura de respuesta', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar estructura de 5 pasos
    expect(prompt).toContain('ESTRUCTURA OBLIGATORIA');
    expect(prompt.toLowerCase()).toContain('apertura');
    expect(prompt.toLowerCase()).toContain('validación');
    expect(prompt.toLowerCase()).toContain('contexto');
    expect(prompt.toLowerCase()).toContain('orientación');
    expect(prompt.toLowerCase()).toContain('cierre');
  });

  it('debe incluir frases ancla para humanizar respuestas', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar que incluye frases ancla (el prompt las tiene en la sección de emociones intensas)
    expect(prompt.toLowerCase()).toContain('aquí estoy');
    expect(prompt.toLowerCase()).toContain('frases');
    expect(prompt.toLowerCase()).toContain('presencia');
  });

  it('debe incluir manejo diferenciado de crisis', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar manejo de crisis/agotamiento
    expect(prompt.toLowerCase()).toContain('agotamiento');
    expect(prompt.toLowerCase()).toContain('contención');
    expect(prompt).toContain('Presencia');
  });

  it('debe incluir instrucciones sobre memoria emocional', () => {
    const memoryContext = 'El usuario mencionó que tiene ansiedad crónica y está en terapia.';
    const prompt = generateIntegratedPrompt(50, null, memoryContext);
    
    // Verificar que incluye el contexto de memoria
    expect(prompt).toContain('CONTEXTO DEL USUARIO');
    expect(prompt).toContain('Memoria Emocional');
    expect(prompt).toContain(memoryContext);
    expect(prompt).toContain('Usa esta memoria con tacto');
  });

  it('debe adaptar el tono según nivel urbano', () => {
    const promptFormal = generateIntegratedPrompt(0, null, '');
    const promptUrbano = generateIntegratedPrompt(75, null, '');
    
    // Verificar que incluye instrucciones de estilo
    expect(promptFormal).toContain('Nivel: Formal');
    expect(promptFormal.toLowerCase()).toContain('lenguaje profesional');
    
    expect(promptUrbano).toContain('Urbano colombiano');
    expect(promptUrbano).toContain('parce');
    expect(promptUrbano).toContain('chimba');
  });

  it('debe incluir ejemplos de respuestas correctas e incorrectas', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar que incluye ejemplos (el prompt usa ✅ y ❌ en lugar de "Correcto" e "Incorrecto")
    expect(prompt).toContain('Ejemplo');
    expect(prompt).toContain('OBLIGATORIO');
  });

  it('debe incluir advertencias sobre múltiples preguntas', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar que incluye advertencias sobre preguntas
    expect(prompt.toLowerCase()).toContain('pregunta');
    expect(prompt.toLowerCase()).toContain('máximo');
  });

  it('debe priorizar presencia sobre soluciones', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar que prioriza presencia
    expect(prompt).toContain('Presencia');
    expect(prompt.toLowerCase()).toContain('acompañar');
    expect(prompt.toLowerCase()).toContain('aquí estoy');
  });

  it('debe incluir información del perfil del usuario cuando está disponible', () => {
    const userProfile = {
      name: 'María',
      favoriteSport: 'fútbol',
      favoriteTeam: 'Millonarios',
      hobbies: ['leer', 'correr'],
      motivations: ['salud mental', 'crecimiento personal'],
      interests: ['psicología', 'meditación'],
      conversationCount: 5
    };
    
    const prompt = generateIntegratedPrompt(50, userProfile, '');
    
    // Verificar que incluye información del perfil
    expect(prompt).toContain('María');
    expect(prompt.toLowerCase()).toContain('fútbol');
    expect(prompt).toContain('Millonarios');
    expect(prompt).toContain('leer');
  });

  it('debe incluir recordatorio final con estructura obligatoria', () => {
    const prompt = generateIntegratedPrompt(50, null, '');
    
    // Verificar recordatorio final
    expect(prompt).toContain('RECORDATORIO FINAL');
    expect(prompt.toLowerCase()).toContain('acompañar');
    expect(prompt.toLowerCase()).toContain('escuchar');
  });
});

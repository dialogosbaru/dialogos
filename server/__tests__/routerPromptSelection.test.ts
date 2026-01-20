import { describe, it, expect } from 'vitest';
import { selectConversationalMode } from '../emotionalRouter.js';
import { EmotionalAnalysis } from '../emotionalDetection.js';

describe('Router Emocional - Selección de Prompt', () => {
  
  it('debe seleccionar modo CONTENCIÓN cuando detecta agotamiento', () => {
    const analysis: EmotionalAnalysis = {
      state: 'sad',
      intensity: 'high',
      needsContainment: true,
      isExhausted: true, // ← Agotamiento detectado
      needsValidation: true,
      allowMemoryRecall: false,
    };
    
    const mode = selectConversationalMode(analysis);
    
    expect(mode).toBe('CONTENCION');
  });

  it('debe seleccionar modo CONTENCIÓN cuando detecta crisis', () => {
    const analysis: EmotionalAnalysis = {
      state: 'crisis',
      intensity: 'high',
      needsContainment: true,
      isExhausted: false,
      needsValidation: true,
      allowMemoryRecall: false,
    };
    
    const mode = selectConversationalMode(analysis);
    
    expect(mode).toBe('CONTENCION');
  });

  it('debe seleccionar modo CONTENCIÓN cuando hay alta intensidad emocional con necesidad de contención', () => {
    const analysis: EmotionalAnalysis = {
      state: 'sad',
      intensity: 'high',
      needsContainment: true,
      isExhausted: false,
      needsValidation: true,
      allowMemoryRecall: false,
    };
    
    const mode = selectConversationalMode(analysis);
    
    expect(mode).toBe('CONTENCION');
  });

  it('debe seleccionar modo ACOMPAÑAMIENTO cuando necesita validación pero no está en crisis', () => {
    const analysis: EmotionalAnalysis = {
      state: 'sad',
      intensity: 'medium',
      needsContainment: false,
      isExhausted: false,
      needsValidation: true,
      allowMemoryRecall: true,
    };
    
    const mode = selectConversationalMode(analysis);
    
    expect(mode).toBe('ACOMPANAMIENTO');
  });

  it('debe seleccionar modo ORIENTACIÓN cuando el estado es positivo', () => {
    const analysis: EmotionalAnalysis = {
      state: 'happy',
      intensity: 'low',
      needsContainment: false,
      isExhausted: false,
      needsValidation: false,
      allowMemoryRecall: true,
    };
    
    const mode = selectConversationalMode(analysis);
    
    expect(mode).toBe('ORIENTACION');
  });

  it('debe seleccionar modo ORIENTACIÓN para estados neutrales de baja intensidad', () => {
    const analysis: EmotionalAnalysis = {
      state: 'neutral',
      intensity: 'low',
      needsContainment: false,
      isExhausted: false,
      needsValidation: false,
      allowMemoryRecall: true,
    };
    
    const mode = selectConversationalMode(analysis);
    
    // El router selecciona ORIENTACIÓN para baja intensidad (puede recibir consejos)
    expect(mode).toBe('ORIENTACION');
  });

  it('debe detectar agotamiento en el mensaje del usuario (ejemplo real)', () => {
    // Simular análisis del mensaje: "Hola hola, estoy triste, me duelen las rodillas"
    const analysis: EmotionalAnalysis = {
      state: 'sad', // Tristeza detectada
      intensity: 'high', // Dolor físico + emocional = alta intensidad
      needsContainment: true, // Dolor requiere contención
      isExhausted: false, // No hay palabras explícitas de agotamiento
      needsValidation: true,
      allowMemoryRecall: false,
    };
    
    const mode = selectConversationalMode(analysis);
    
    // Debería seleccionar CONTENCIÓN porque:
    // - needsContainment = true
    // - intensity = high
    expect(mode).toBe('CONTENCION');
  });
});

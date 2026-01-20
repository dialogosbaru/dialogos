import { describe, it, expect } from 'vitest';
import { detectCrisis, getEmergencyResources } from '../crisisDetection';

describe('Crisis Detection System', () => {
  describe('detectCrisis', () => {
    it('should detect explicit suicidal ideation (critical)', () => {
      const result = detectCrisis('Quiero morir, no aguanto más');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.category).toBe('suicide');
      expect(result.matchedText).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0.5);
    });
    
    it('should detect suicidal planning (critical)', () => {
      const result = detectCrisis('Estoy buscando formas de suicidio');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.category).toBe('suicide');
    });
    
    it('should detect self-harm (high)', () => {
      const result = detectCrisis('Me corté de nuevo, no puedo parar');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('self_harm');
    });
    
    it('should detect violence (high)', () => {
      const result = detectCrisis('Quiero matar a alguien');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('violence');
    });
    
    it('should detect severe distress (medium)', () => {
      const result = detectCrisis('No puedo más, estoy desesperado');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.category).toBe('severe_distress');
    });
    
    it('should not detect crisis in normal sad message', () => {
      const result = detectCrisis('Estoy triste hoy, me duelen las rodillas');
      
      expect(result.detected).toBe(false);
      expect(result.severity).toBe(null);
      expect(result.category).toBe(null);
    });
    
    it('should not detect crisis in happy message', () => {
      const result = detectCrisis('Hola! Hoy me siento mucho mejor');
      
      expect(result.detected).toBe(false);
    });
    
    it('should handle accents and punctuation', () => {
      const result = detectCrisis('¡Quiero morir! ¿Por qué sigo aquí?');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('critical');
    });
    
    it('should handle uppercase', () => {
      const result = detectCrisis('QUIERO MORIR');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('critical');
    });
    
    it('should prioritize critical over medium severity', () => {
      const result = detectCrisis('No puedo más, quiero morir');
      
      expect(result.detected).toBe(true);
      expect(result.severity).toBe('critical'); // Should match "quiero morir" first
      expect(result.category).toBe('suicide');
    });
    
    it('should calculate confidence based on phrase length', () => {
      const shortResult = detectCrisis('quiero morir');
      const longResult = detectCrisis('Hola, estoy bien, solo quiero morir un poco');
      
      expect(shortResult.confidence).toBeGreaterThan(longResult.confidence);
    });
  });
  
  describe('getEmergencyResources', () => {
    it('should return suicide-specific resources', () => {
      const resources = getEmergencyResources('suicide');
      
      expect(resources.title).toContain('Ayuda Inmediata');
      expect(resources.message).toContain('Tu vida es valiosa');
      expect(resources.resources).toHaveLength(3);
      expect(resources.resources[0].name).toContain('Prevención del Suicidio');
    });
    
    it('should return self-harm-specific resources', () => {
      const resources = getEmergencyResources('self_harm');
      
      expect(resources.title).toContain('Apoyo Profesional');
      expect(resources.message).toContain('Lastimarte no es la solución');
    });
    
    it('should return violence-specific resources', () => {
      const resources = getEmergencyResources('violence');
      
      expect(resources.title).toContain('Controlar Impulsos');
      expect(resources.message).toContain('impulsos violentos');
    });
    
    it('should return default resources for unknown category', () => {
      const resources = getEmergencyResources(null);
      
      expect(resources.title).toContain('Recursos de Ayuda');
      expect(resources.resources).toHaveLength(3);
    });
    
    it('should include all critical phone numbers', () => {
      const resources = getEmergencyResources('suicide');
      
      const numbers = resources.resources.map(r => r.number);
      expect(numbers).toContain('01 800 113 113');
      expect(numbers).toContain('106');
      expect(numbers).toContain('123');
    });
  });
});

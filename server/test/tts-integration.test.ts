import { describe, it, expect } from 'vitest';
import { synthesizeSpeech } from '../_core/googleTTS.js';

describe('Google Cloud TTS Integration', () => {
  it('should synthesize speech with neutral emotion', async () => {
    const result = await synthesizeSpeech({
      text: 'Hola, soy Leo. ¿Cómo estás?',
      emotion: 'neutral',
      languageCode: 'es-ES',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeDefined();
    expect(result.audioContent.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('audio/mpeg');
  }, 15000); // 15 segundos de timeout

  it('should synthesize speech with happy emotion', async () => {
    const result = await synthesizeSpeech({
      text: '¡Qué chimba! Me alegra mucho escucharte.',
      emotion: 'happy',
      languageCode: 'es-ES',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeDefined();
    expect(result.audioContent.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('audio/mpeg');
  }, 15000);

  it('should synthesize speech with empathetic emotion', async () => {
    const result = await synthesizeSpeech({
      text: 'Entiendo que estés pasando por un momento difícil.',
      emotion: 'empathetic',
      languageCode: 'es-ES',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeDefined();
    expect(result.audioContent.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('audio/mpeg');
  }, 15000);

  it('should synthesize speech with motivational emotion', async () => {
    const result = await synthesizeSpeech({
      text: '¡Dale parce! Tú puedes con esto y más. Eres berraco.',
      emotion: 'motivational',
      languageCode: 'es-ES',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeDefined();
    expect(result.audioContent.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('audio/mpeg');
  }, 15000);

  it('should handle moderately long text (up to 1000 characters)', async () => {
    const longText = 'Hola amigo, espero que estés muy bien. '.repeat(25); // ~1000 caracteres
    
    const result = await synthesizeSpeech({
      text: longText,
      emotion: 'neutral',
      languageCode: 'es-ES',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeDefined();
    expect(result.audioContent.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('audio/mpeg');
  }, 20000); // 20 segundos para textos largos
});

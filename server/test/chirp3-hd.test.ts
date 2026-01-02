import { describe, it, expect } from 'vitest';
import { synthesizeSpeech } from '../_core/googleTTS.js';

describe('Chirp 3: HD TTS Integration', () => {
  it('should synthesize speech with Rasalgethi voice', async () => {
    const result = await synthesizeSpeech({
      text: 'Hola, soy Leo. ¿Cómo estás?',
      voiceName: 'Rasalgethi',
      emotion: 'neutral',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeTruthy();
    expect(result.mimeType).toBe('audio/mpeg');
    expect(result.audioContent.length).toBeGreaterThan(0);
    
    console.log(`✅ Rasalgethi voice test passed (${result.audioContent.length} bytes)`);
  }, 30000);

  it('should synthesize speech with Kore voice (female)', async () => {
    const result = await synthesizeSpeech({
      text: '¡Hola! Me alegra mucho verte.',
      voiceName: 'Kore',
      emotion: 'happy',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeTruthy();
    expect(result.mimeType).toBe('audio/mpeg');
    
    console.log(`✅ Kore voice test passed (${result.audioContent.length} bytes)`);
  }, 30000);

  it('should synthesize speech with Charon voice', async () => {
    const result = await synthesizeSpeech({
      text: 'Esta es una prueba de la voz Charon.',
      voiceName: 'Charon',
      emotion: 'neutral',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeTruthy();
    
    console.log(`✅ Charon voice test passed (${result.audioContent.length} bytes)`);
  }, 30000);

  it('should handle different emotions', async () => {
    const emotions: Array<'happy' | 'sad' | 'motivational' | 'empathetic' | 'neutral'> = [
      'happy',
      'sad',
      'motivational',
      'empathetic',
      'neutral',
    ];

    for (const emotion of emotions) {
      const result = await synthesizeSpeech({
        text: `Probando emoción: ${emotion}`,
        voiceName: 'Rasalgethi',
        emotion,
      });

      expect(result).toBeDefined();
      expect(result.audioContent).toBeTruthy();
      console.log(`✅ Emotion "${emotion}" test passed`);
    }
  }, 60000);

  it('should handle long text', async () => {
    const longText = 'Hola, soy Leo. '.repeat(50); // ~700 caracteres
    
    const result = await synthesizeSpeech({
      text: longText,
      voiceName: 'Rasalgethi',
      emotion: 'neutral',
    });

    expect(result).toBeDefined();
    expect(result.audioContent).toBeTruthy();
    expect(result.audioContent.length).toBeGreaterThan(10000); // Audio largo
    
    console.log(`✅ Long text test passed (${result.audioContent.length} bytes)`);
  }, 30000);
});

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { synthesizeSpeech, listAvailableVoices } from '../_core/googleTTS.js';

/**
 * Router de Text-to-Speech usando Google Cloud TTS con WaveNet
 */
export const ttsRouter = router({
  /**
   * Sintetizar texto a audio usando Google Cloud TTS
   */
  synthesize: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000), // Límite de 5000 caracteres por solicitud
        emotion: z
          .enum(['happy', 'sad', 'motivational', 'empathetic', 'surprised', 'reflective', 'neutral'])
          .optional()
          .default('neutral'),
        voiceName: z.string().optional().default('es-US-Neural2-B'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await synthesizeSpeech({
          text: input.text,
          emotion: input.emotion,
          voiceName: input.voiceName,
        });

        return {
          success: true,
          audioContent: result.audioContent,
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('[TTS Router] Error synthesizing speech:', error);
        throw new Error(
          `Failed to synthesize speech: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Listar voces disponibles en Google Cloud TTS
   */
  listVoices: publicProcedure
    .input(
      z.object({
        languageCode: z.string().optional().default('es-ES'),
      })
    )
    .query(async ({ input }) => {
      try {
        const voices = await listAvailableVoices();
        return {
          success: true,
          voices: voices.map((voice) => ({
            name: voice.name,
            languageCodes: voice.languageCodes,
            ssmlGender: voice.ssmlGender,
            naturalSampleRateHertz: voice.naturalSampleRateHertz,
          })),
        };
      } catch (error) {
        console.error('[TTS Router] Error listing voices:', error);
        throw new Error(
          `Failed to list voices: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),
});

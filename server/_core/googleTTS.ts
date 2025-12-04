import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { google } from '@google-cloud/text-to-speech/build/protos/protos';

// Inicializar cliente de Google Cloud TTS con credenciales de la cuenta de servicio
const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_TTS_API_KEY || '{}'),
});

export interface TTSRequest {
  text: string;
  emotion?: 'happy' | 'sad' | 'motivational' | 'empathetic' | 'surprised' | 'reflective' | 'neutral';
  voiceName?: string; // Nombre completo de la voz (ej: es-US-Neural2-B)
}

export interface TTSResponse {
  audioContent: string; // Base64 encoded audio
  mimeType: string;
}

/**
 * Mapeo de emociones a parámetros de voz de Google Cloud TTS
 * Usa SSML para controlar velocidad (speaking rate) y tono (pitch)
 */
const emotionToVoiceParams = {
  happy: { rate: 1.15, pitch: 2.0 },
  sad: { rate: 0.85, pitch: -2.0 },
  motivational: { rate: 1.1, pitch: 1.5 },
  empathetic: { rate: 0.95, pitch: -0.5 },
  surprised: { rate: 1.2, pitch: 3.0 },
  reflective: { rate: 0.9, pitch: -1.0 },
  neutral: { rate: 1.0, pitch: 0.0 },
};

/**
 * Genera audio usando Google Cloud Text-to-Speech con WaveNet
 * @param request - Texto a sintetizar y parámetros opcionales
 * @returns Audio en formato base64 y tipo MIME
 */
export async function synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
  const { text, emotion = 'neutral', voiceName = 'es-US-Neural2-B' } = request;

  // Obtener parámetros de voz según la emoción
  const voiceParams = emotionToVoiceParams[emotion];

  // Construir SSML para controlar velocidad y tono
  const ssmlText = `
    <speak>
      <prosody rate="${voiceParams.rate}" pitch="${voiceParams.pitch > 0 ? '+' : ''}${voiceParams.pitch}st">
        ${text}
      </prosody>
    </speak>
  `;

  // Extraer el código de idioma del nombre de la voz
  // Formato: es-US-Neural2-B -> es-US
  const voiceLanguageCode = voiceName.split('-').slice(0, 2).join('-');

  // Configurar la solicitud de síntesis
  const ttsRequest: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { ssml: ssmlText },
    voice: {
      languageCode: voiceLanguageCode,
      name: voiceName,
      ssmlGender: 'MALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0, // Ya controlado por SSML, pero podemos ajustar aquí también
      pitch: 0.0, // Ya controlado por SSML
    },
  };

  try {
    // Llamar a la API de Google Cloud TTS
    const [response] = await client.synthesizeSpeech(ttsRequest);

    if (!response.audioContent) {
      throw new Error('No audio content received from Google Cloud TTS');
    }

    // Convertir el audio a base64
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');

    return {
      audioContent: audioBase64,
      mimeType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('[Google TTS] Error synthesizing speech:', error);
    throw new Error(`Failed to synthesize speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lista las voces disponibles en Google Cloud TTS para un idioma específico
 * @param languageCode - Código de idioma (e.g., 'es-ES', 'en-US')
 * @returns Lista de voces disponibles
 */
export async function listAvailableVoices(languageCode: string = 'es-ES') {
  try {
    const [response] = await client.listVoices({ languageCode });
    return response.voices || [];
  } catch (error) {
    console.error('[Google TTS] Error listing voices:', error);
    throw new Error(`Failed to list voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

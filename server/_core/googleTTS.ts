import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { google } from '@google-cloud/text-to-speech/build/protos/protos';

// Inicializar cliente de Google Cloud TTS con credenciales de la cuenta de servicio
let client: TextToSpeechClient;

function initializeClient() {
  if (!client) {
    // Check if we have separate env vars or JSON
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;

    if (projectId && privateKey && clientEmail) {
      // Use separate env vars
      client = new TextToSpeechClient({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        projectId,
      });
    } else {
      // Fallback to JSON (for development)
      const jsonKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
      if (!jsonKey) {
        throw new Error('Google Cloud credentials not configured. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, and GOOGLE_CLOUD_CLIENT_EMAIL');
      }
      client = new TextToSpeechClient({
        credentials: JSON.parse(jsonKey),
      });
    }
  }
  return client;
}

export interface TTSRequest {
  text: string;
  emotion?: 'happy' | 'sad' | 'motivational' | 'empathetic' | 'surprised' | 'reflective' | 'neutral';
  voiceName?: string; // Voice ID de Chirp 3: HD (ej: Rasalgethi, Kore, Charon)
}

export interface TTSResponse {
  audioContent: string; // Base64 encoded audio
  mimeType: string;
}

/**
 * Genera audio usando Chirp 3: HD (Google Cloud Text-to-Speech)
 * @param request - Texto a sintetizar y parámetros opcionales
 * @returns Audio en formato base64 y tipo MIME
 */
export async function synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
  const { text, emotion = 'neutral', voiceName = 'Rasalgethi' } = request;

  // Inicializar cliente
  const ttsClient = initializeClient();

  // Configurar la solicitud de síntesis con Chirp 3: HD
  const ttsRequest: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { 
      text: text,
    },
    voice: {
      languageCode: 'es-US', // Chirp 3: HD usa es-US para español latinoamericano
      name: `es-US-Chirp3-HD-${voiceName}`, // Formato: es-US-Chirp3-HD-Rasalgethi
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  };

  try {
    console.log(`[Chirp 3: HD] Synthesizing speech with voice: ${voiceName}`);
    
    // Llamar a la API de Google Cloud TTS con Chirp 3: HD
    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);

    if (!response.audioContent) {
      throw new Error('No audio content received from Chirp 3: HD');
    }

    // Convertir el audio a base64
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');

    return {
      audioContent: audioBase64,
      mimeType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('[Chirp 3: HD] Error synthesizing speech:', error);
    throw new Error(`Failed to synthesize speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lista las voces disponibles en Chirp 3: HD
 * @returns Lista de voces disponibles
 */
export async function listAvailableVoices() {
  try {
    const ttsClient = initializeClient();
    const [response] = await ttsClient.listVoices({ 
      languageCode: 'es-US',
    });
    return response.voices || [];
  } catch (error) {
    console.error('[Chirp 3: HD] Error listing voices:', error);
    throw new Error(`Failed to list voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

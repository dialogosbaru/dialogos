/**
 * Voice configuration for Gemini-TTS (Vertex AI)
 * Available voices from Google Cloud Text-to-Speech Gemini-TTS
 */

export type VoiceGender = 'male' | 'female';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  label: string;
  description: string;
}

/**
 * Available Gemini-TTS voices
 * These are the speaker_id values used in Gemini-TTS API
 */
export const AVAILABLE_VOICES: VoiceOption[] = [
  // Male voices (4)
  {
    id: 'Rasalgethi',
    name: 'Rasalgethi',
    gender: 'male',
    label: '👨 Rasalgethi',
    description: 'Voz masculina profunda y expresiva',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'male',
    label: '👨 Charon',
    description: 'Voz masculina clara y natural',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'male',
    label: '👨 Fenrir',
    description: 'Voz masculina cálida y amigable',
  },
  {
    id: 'Alnilam',
    name: 'Alnilam',
    gender: 'male',
    label: '👨 Alnilam',
    description: 'Voz masculina enérgica y dinámica',
  },
  // Female voices (2)
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'female',
    label: '👩 Kore',
    description: 'Voz femenina clara y expresiva',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'female',
    label: '👩 Zephyr',
    description: 'Voz femenina suave y natural',
  },
];

/**
 * Default voice (Rasalgethi - male)
 */
export const DEFAULT_VOICE = AVAILABLE_VOICES[0];

/**
 * Get voice by ID
 */
export function getVoiceById(id: string): VoiceOption | undefined {
  return AVAILABLE_VOICES.find((voice) => voice.id === id);
}

/**
 * Get voices by gender
 */
export function getVoicesByGender(gender: VoiceGender): VoiceOption[] {
  return AVAILABLE_VOICES.filter((voice) => voice.gender === gender);
}

/**
 * Configuración de voces disponibles en Google Cloud TTS
 */

export type VoiceRegion = 'es-ES' | 'es-US';
export type VoiceGender = 'MALE' | 'FEMALE';

export interface VoiceOption {
  name: string;
  region: VoiceRegion;
  gender: VoiceGender;
  label: string;
  description: string;
}

/**
 * Voces Neural2 disponibles (mejor calidad)
 */
export const AVAILABLE_VOICES: VoiceOption[] = [
  // Voces Latinoamericanas (es-US)
  {
    name: 'es-US-Neural2-B',
    region: 'es-US',
    gender: 'MALE',
    label: 'Leo (Latinoamérica)',
    description: 'Voz masculina con acento latinoamericano neutral'
  },
  {
    name: 'es-US-Neural2-A',
    region: 'es-US',
    gender: 'FEMALE',
    label: 'Lea (Latinoamérica)',
    description: 'Voz femenina con acento latinoamericano neutral'
  },
  {
    name: 'es-US-Neural2-C',
    region: 'es-US',
    gender: 'MALE',
    label: 'Lucas (Latinoamérica)',
    description: 'Voz masculina alternativa con acento latinoamericano'
  },
  
  // Voces de España (es-ES)
  {
    name: 'es-ES-Neural2-B',
    region: 'es-ES',
    gender: 'MALE',
    label: 'Leo (España)',
    description: 'Voz masculina con acento español'
  },
  {
    name: 'es-ES-Neural2-A',
    region: 'es-ES',
    gender: 'FEMALE',
    label: 'Lea (España)',
    description: 'Voz femenina con acento español'
  },
  {
    name: 'es-ES-Neural2-F',
    region: 'es-ES',
    gender: 'MALE',
    label: 'Felipe (España)',
    description: 'Voz masculina alternativa con acento español'
  },
];

/**
 * Voz predeterminada (Latinoamérica, masculina)
 */
export const DEFAULT_VOICE = AVAILABLE_VOICES[0]; // es-US-Neural2-B

/**
 * Obtiene una voz por nombre
 */
export function getVoiceByName(name: string): VoiceOption | undefined {
  return AVAILABLE_VOICES.find(voice => voice.name === name);
}

/**
 * Obtiene voces filtradas por región
 */
export function getVoicesByRegion(region: VoiceRegion): VoiceOption[] {
  return AVAILABLE_VOICES.filter(voice => voice.region === region);
}

/**
 * Obtiene voces filtradas por género
 */
export function getVoicesByGender(gender: VoiceGender): VoiceOption[] {
  return AVAILABLE_VOICES.filter(voice => voice.gender === gender);
}

/**
 * Obtiene voces filtradas por región y género
 */
export function getVoicesByRegionAndGender(region: VoiceRegion, gender: VoiceGender): VoiceOption[] {
  return AVAILABLE_VOICES.filter(voice => voice.region === region && voice.gender === gender);
}

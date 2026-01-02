import { useCallback, useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getVoiceById, DEFAULT_VOICE } from '@shared/voiceConfig';
import { trpc } from '@/lib/trpc';
import { getAudioFromCache, saveAudioToCache } from '@/lib/audioCache';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  isFinal: boolean;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Emotion = 'happy' | 'sad' | 'motivational' | 'empathetic' | 'surprised' | 'reflective' | 'neutral';

/**
 * Analiza el contenido emocional del texto para determinar la emoción dominante
 */
function detectEmotion(text: string): Emotion {
  const lowerText = text.toLowerCase();
  
  // Felicidad/Emoción
  if (
    lowerText.includes('¡') ||
    lowerText.includes('chimba') ||
    lowerText.includes('bacano') ||
    lowerText.includes('genial') ||
    lowerText.includes('excelente') ||
    lowerText.includes('felicidades') ||
    lowerText.includes('increíble') ||
    lowerText.includes('brutal') ||
    lowerText.includes('jajaja') ||
    lowerText.includes('jeje')
  ) {
    return 'happy';
  }
  
  // Tristeza/Empatía
  if (
    lowerText.includes('lamento') ||
    lowerText.includes('triste') ||
    lowerText.includes('difícil') ||
    lowerText.includes('entiendo') ||
    lowerText.includes('comprendo') ||
    lowerText.includes('uff') ||
    lowerText.includes('gonorrea') ||
    lowerText.includes('mal rollo') ||
    lowerText.includes('duro')
  ) {
    return 'empathetic';
  }
  
  // Motivación/Ánimo
  if (
    lowerText.includes('dale') ||
    lowerText.includes('vas a') ||
    lowerText.includes('puedes') ||
    lowerText.includes('adelante') ||
    lowerText.includes('ánimo') ||
    lowerText.includes('berraco') ||
    lowerText.includes('romperla') ||
    lowerText.includes('vamos')
  ) {
    return 'motivational';
  }
  
  // Sorpresa
  if (
    lowerText.includes('wow') ||
    lowerText.includes('guau') ||
    lowerText.includes('¿en serio?') ||
    lowerText.includes('no puede ser') ||
    lowerText.includes('impresionante')
  ) {
    return 'surprised';
  }
  
  // Reflexión
  if (
    lowerText.includes('creo que') ||
    lowerText.includes('pienso que') ||
    lowerText.includes('tal vez') ||
    lowerText.includes('quizás') ||
    lowerText.includes('reflexiona') ||
    lowerText.includes('considera')
  ) {
    return 'reflective';
  }
  
  return 'neutral';
}

export function useSpeech() {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Mutación de tRPC para sintetizar voz con Google Cloud TTS
  const synthesizeMutation = trpc.tts.synthesize.useMutation();

  // Inicializar el reconocimiento de voz (STT - sigue usando Web Speech API)
  const initRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Speech Recognition not supported');
        return null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Solo actualizar con el texto final, sin acumular intermedios
        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return recognitionRef.current;
  }, [language]);

  // Iniciar escucha
  const startListening = useCallback(() => {
    const recognition = initRecognition();
    if (recognition) {
      recognition.start();
    }
  }, [initRecognition]);

  // Detener escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /**
   * Hablar usando Google Cloud Text-to-Speech con WaveNet
   * Detecta automáticamente la emoción del texto y ajusta la voz
   */
  const speak = useCallback(
    async (text: string) => {
      try {
        // Detener cualquier audio anterior
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        setIsSpeaking(true);

        // Detectar emoción del texto
        const emotion = detectEmotion(text);
        console.log(`[TTS] Detected emotion: ${emotion}`);

        // Obtener la voz seleccionada del localStorage
        const savedVoiceId = localStorage.getItem('selectedVoiceId') || DEFAULT_VOICE.id;
        const selectedVoice = getVoiceById(savedVoiceId) || DEFAULT_VOICE;
        const voiceName = selectedVoice.id;
        
        console.log(`[TTS] Using voice: ${voiceName}`);

        // Verificar si el audio está en caché
        const cachedAudio = await getAudioFromCache(text, emotion, voiceName);
        
        let audioContent: string;
        let mimeType: string;

        if (cachedAudio) {
          console.log('[TTS] Using cached audio');
          audioContent = cachedAudio.audioContent;
          mimeType = cachedAudio.mimeType;
        } else {
          console.log('[TTS] Calling API to synthesize audio');
          
          // Llamar al backend para sintetizar el audio
          const result = await synthesizeMutation.mutateAsync({
            text,
            emotion,
            voiceName,
          });

          if (!result.success || !result.audioContent) {
            throw new Error('Failed to synthesize speech');
          }

          audioContent = result.audioContent;
          mimeType = result.mimeType;

          // Guardar en caché para uso futuro
          await saveAudioToCache(text, emotion, voiceName, audioContent, mimeType);
        }

        // Convertir el audio base64 a un blob y reproducirlo
        const audioBlob = base64ToBlob(audioContent, mimeType);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = (error) => {
          console.error('[TTS] Audio playback error:', error);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        console.error('[TTS] Error speaking:', error);
        setIsSpeaking(false);
      }
    },
    [language, synthesizeMutation]
  );

  // Detener reproducción de audio
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}

/**
 * Convierte una cadena base64 a un Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

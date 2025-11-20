import { useCallback, useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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

/**
 * Procesa el texto para agregar pausas naturales y énfasis
 * Convierte el texto en algo más expresivo y humano
 */
function processTextForNaturalSpeech(text: string): string {
  let processedText = text;

  // Agregar pausas después de signos de puntuación (simulando respiración natural)
  processedText = processedText.replace(/\./g, '. ');
  processedText = processedText.replace(/,/g, ', ');
  processedText = processedText.replace(/!/g, '! ');
  processedText = processedText.replace(/\?/g, '? ');
  
  // Agregar pausas más largas después de oraciones completas
  processedText = processedText.replace(/\. /g, '.  ');
  processedText = processedText.replace(/! /g, '!  ');
  processedText = processedText.replace(/\? /g, '?  ');

  // Limpiar espacios múltiples
  processedText = processedText.replace(/\s+/g, ' ').trim();

  return processedText;
}

/**
 * Selecciona la mejor voz disponible según el idioma y características deseadas
 * Prioriza voces más naturales y expresivas
 */
function selectBestVoice(language: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLang = language === 'es' ? 'es' : 'en';
  
  // Filtrar voces por idioma
  const languageVoices = voices.filter(voice => voice.lang.startsWith(targetLang));
  
  if (languageVoices.length === 0) {
    // Si no hay voces del idioma, usar cualquier voz disponible
    return voices[0];
  }

  // Priorizar voces con características más naturales
  // 1. Voces premium/mejoradas (Google, Microsoft Neural, etc.)
  const premiumVoice = languageVoices.find(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Neural') ||
    voice.name.includes('Premium') ||
    voice.name.includes('Enhanced')
  );
  if (premiumVoice) return premiumVoice;

  // 2. Voces locales (generalmente mejor calidad)
  const localVoice = languageVoices.find(voice => voice.localService);
  if (localVoice) return localVoice;

  // 3. Cualquier voz del idioma correcto
  return languageVoices[0];
}

export function useSpeech() {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cargar voces disponibles
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      // Cargar voces inmediatamente
      loadVoices();

      // Escuchar cambios en las voces (algunos navegadores cargan voces de forma asíncrona)
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Inicializar el reconocimiento de voz
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
        let interimTranscript = '';

        for (let i = event.results.length - 1; i >= 0; i--) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          setTranscript((prev) => {
            const parts = prev.split(' ');
            parts[parts.length - 1] = interimTranscript;
            return parts.join(' ');
          });
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

  // Hablar (TTS) con parámetros de voz ajustables y procesamiento natural
  const speak = useCallback(
    (text: string, voiceProfile?: { rate: number; pitch: number; volume: number }) => {
      try {
        // Verificar que el navegador soporta síntesis de voz
        if (!window.speechSynthesis) {
          console.warn('Speech Synthesis not supported in this browser');
          return;
        }

        // Cancelar cualquier síntesis anterior
        window.speechSynthesis.cancel();

        // Procesar el texto para hacerlo más natural
        const processedText = processTextForNaturalSpeech(text);

        const utterance = new SpeechSynthesisUtterance(processedText);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        
        // Seleccionar la mejor voz disponible
        const bestVoice = selectBestVoice(language, availableVoices);
        if (bestVoice) {
          utterance.voice = bestVoice;
          console.log('Using voice:', bestVoice.name);
        }

        // Usar parámetros de voz personalizados si se proporcionan
        utterance.rate = voiceProfile?.rate || 1;
        utterance.pitch = voiceProfile?.pitch || 1;
        utterance.volume = voiceProfile?.volume || 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (event: any) => {
          setIsSpeaking(false);
          console.error('TTS error:', event.error || 'Unknown error');
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error in speak function:', error);
        setIsSpeaking(false);
      }
    },
    [language, availableVoices]
  );

  // Detener síntesis de voz
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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

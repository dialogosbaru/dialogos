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

interface EmotionalSegment {
  text: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'empathetic' | 'motivational' | 'questioning';
  rate: number;
  pitch: number;
  pauseBefore: number; // milisegundos
}

/**
 * Analiza el contenido emocional del texto y divide en segmentos con diferentes características vocales
 */
function analyzeEmotionalContent(text: string): EmotionalSegment[] {
  const segments: EmotionalSegment[] = [];
  
  // Dividir el texto en oraciones
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    let emotion: EmotionalSegment['emotion'] = 'neutral';
    let rate = 1.0;
    let pitch = 1.0;
    let pauseBefore = index > 0 ? 400 : 0; // Pausa entre oraciones
    
    // Detectar emociones basadas en palabras clave y puntuación
    
    // Felicidad/Emoción
    if (
      lowerSentence.includes('¡') ||
      lowerSentence.includes('chimba') ||
      lowerSentence.includes('bacano') ||
      lowerSentence.includes('genial') ||
      lowerSentence.includes('excelente') ||
      lowerSentence.includes('felicidades') ||
      lowerSentence.includes('increíble') ||
      lowerSentence.includes('brutal')
    ) {
      emotion = 'excited';
      rate = 1.15; // Más rápido cuando está emocionado
      pitch = 1.15; // Tono más agudo
      pauseBefore = index > 0 ? 300 : 0; // Pausas más cortas
    }
    
    // Tristeza/Empatía
    else if (
      lowerSentence.includes('lamento') ||
      lowerSentence.includes('triste') ||
      lowerSentence.includes('difícil') ||
      lowerSentence.includes('entiendo') ||
      lowerSentence.includes('comprendo') ||
      lowerSentence.includes('uff') ||
      lowerSentence.includes('gonorrea') ||
      lowerSentence.includes('mal rollo')
    ) {
      emotion = 'empathetic';
      rate = 0.85; // Más lento y pausado
      pitch = 0.9; // Tono más grave
      pauseBefore = index > 0 ? 500 : 0; // Pausas más largas
    }
    
    // Motivación/Ánimo
    else if (
      lowerSentence.includes('dale') ||
      lowerSentence.includes('vas a') ||
      lowerSentence.includes('puedes') ||
      lowerSentence.includes('adelante') ||
      lowerSentence.includes('ánimo') ||
      lowerSentence.includes('berraco') ||
      lowerSentence.includes('romperla')
    ) {
      emotion = 'motivational';
      rate = 1.1; // Ritmo energético
      pitch = 1.1; // Tono elevado
      pauseBefore = index > 0 ? 350 : 0;
    }
    
    // Preguntas
    else if (sentence.includes('?')) {
      emotion = 'questioning';
      rate = 0.95; // Ligeramente más lento
      pitch = 1.05; // Tono sube al final
      pauseBefore = index > 0 ? 450 : 0; // Pausa antes de preguntar
    }
    
    segments.push({
      text: sentence.trim(),
      emotion,
      rate,
      pitch,
      pauseBefore
    });
  });
  
  return segments;
}

/**
 * Procesa el texto para agregar pausas naturales, respiraciones y énfasis
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
  
  // Agregar pausas antes de palabras clave emocionales (énfasis)
  const emphasisWords = ['chimba', 'bacano', 'berraco', 'gonorrea', 'brutal', 'increíble', 'genial'];
  emphasisWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    processedText = processedText.replace(regex, ` ${word}`);
  });

  // Limpiar espacios múltiples
  processedText = processedText.replace(/\s+/g, ' ').trim();

  return processedText;
}

/**
 * Selecciona la mejor voz disponible según el idioma y características deseadas
 */
function selectBestVoice(language: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLang = language === 'es' ? 'es' : 'en';
  
  // Filtrar voces por idioma
  const languageVoices = voices.filter(voice => voice.lang.startsWith(targetLang));
  
  if (languageVoices.length === 0) {
    return voices[0];
  }

  // Priorizar voces con características más naturales
  const premiumVoice = languageVoices.find(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Neural') ||
    voice.name.includes('Premium') ||
    voice.name.includes('Enhanced')
  );
  if (premiumVoice) return premiumVoice;

  const localVoice = languageVoices.find(voice => voice.localService);
  if (localVoice) return localVoice;

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

      loadVoices();

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

  /**
   * Habla un segmento emocional con características vocales específicas
   */
  const speakSegment = useCallback(
    (segment: EmotionalSegment, voice: SpeechSynthesisVoice | null): Promise<void> => {
      return new Promise((resolve) => {
        // Esperar la pausa antes del segmento (simulando respiración)
        setTimeout(() => {
          const processedText = processTextForNaturalSpeech(segment.text);
          const utterance = new SpeechSynthesisUtterance(processedText);
          utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
          
          if (voice) {
            utterance.voice = voice;
          }

          utterance.rate = segment.rate;
          utterance.pitch = segment.pitch;
          utterance.volume = 1;

          utterance.onend = () => {
            resolve();
          };

          utterance.onerror = (event: any) => {
            console.error('TTS segment error:', event.error || 'Unknown error');
            resolve();
          };

          window.speechSynthesis.speak(utterance);
        }, segment.pauseBefore);
      });
    },
    [language]
  );

  /**
   * Hablar con expresividad emocional avanzada
   * Analiza el contenido emocional y ajusta los parámetros de voz dinámicamente
   */
  const speak = useCallback(
    async (text: string, voiceProfile?: { rate: number; pitch: number; volume: number }) => {
      try {
        if (!window.speechSynthesis) {
          console.warn('Speech Synthesis not supported in this browser');
          return;
        }

        // Cancelar cualquier síntesis anterior
        window.speechSynthesis.cancel();
        setIsSpeaking(true);

        // Seleccionar la mejor voz
        const bestVoice = selectBestVoice(language, availableVoices);
        if (bestVoice) {
          console.log('Using voice:', bestVoice.name);
        }

        // Si se proporciona un perfil de voz personalizado, usar síntesis simple
        if (voiceProfile) {
          const processedText = processTextForNaturalSpeech(text);
          const utterance = new SpeechSynthesisUtterance(processedText);
          utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
          
          if (bestVoice) {
            utterance.voice = bestVoice;
          }

          utterance.rate = voiceProfile.rate;
          utterance.pitch = voiceProfile.pitch;
          utterance.volume = voiceProfile.volume;

          utterance.onend = () => {
            setIsSpeaking(false);
          };

          utterance.onerror = (event: any) => {
            setIsSpeaking(false);
            console.error('TTS error:', event.error || 'Unknown error');
          };

          window.speechSynthesis.speak(utterance);
          return;
        }

        // Análisis emocional avanzado para calcular parámetros promedio
        const segments = analyzeEmotionalContent(text);
        console.log('Emotional segments:', segments.map(s => ({ emotion: s.emotion, rate: s.rate, pitch: s.pitch })));

        // Calcular parámetros promedio ponderados según la longitud de cada segmento
        let totalRate = 0;
        let totalPitch = 0;
        let totalLength = 0;

        segments.forEach(segment => {
          const segmentLength = segment.text.length;
          totalRate += segment.rate * segmentLength;
          totalPitch += segment.pitch * segmentLength;
          totalLength += segmentLength;
        });

        const avgRate = totalLength > 0 ? totalRate / totalLength : 1.0;
        const avgPitch = totalLength > 0 ? totalPitch / totalLength : 1.0;

        // Validar y limitar parámetros para evitar errores de síntesis
        const safeRate = Math.max(0.5, Math.min(2.0, avgRate)); // Limitar entre 0.5 y 2.0
        const safePitch = Math.max(0.5, Math.min(2.0, avgPitch)); // Limitar entre 0.5 y 2.0

        console.log('Average voice parameters:', { rate: safeRate, pitch: safePitch });

        // Procesar el texto con pausas naturales
        const processedText = processTextForNaturalSpeech(text);
        const utterance = new SpeechSynthesisUtterance(processedText);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        utterance.rate = safeRate;
        utterance.pitch = safePitch;
        utterance.volume = 1;

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (event: any) => {
          setIsSpeaking(false);
          console.error('TTS error:', event.error || 'Unknown error');
        };

        // Agregar un pequeño delay para evitar conflictos con cancel()
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
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

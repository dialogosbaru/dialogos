import { useCallback, useRef, useState } from 'react';
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

export function useSpeech() {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Hablar (TTS)
  const speak = useCallback(
    (text: string) => {
      // Cancelar cualquier síntesis anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error('TTS error');
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  // Detener síntesis de voz
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
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

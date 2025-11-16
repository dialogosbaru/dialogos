import { useLanguage } from '@/contexts/LanguageContext';
import { useCallback } from 'react';

interface LeoResponse {
  text: string;
  emotion?: string;
}

export function useLeoResponses() {
  const { language } = useLanguage();

  const responses = {
    es: {
      greeting: [
        '¡Hola! Soy Leo, tu amigo conversacional. ¿Cómo te sientes hoy?',
        'Hola, me alegra verte. ¿Qué hay en tu mente hoy?',
        'Bienvenido, estoy aquí para escucharte. ¿Cómo estás?',
      ],
      positive: [
        'Me alegra mucho escuchar eso. Tu energía es contagiosa.',
        'Qué bueno, me encanta tu entusiasmo.',
        'Eso suena maravilloso, me alegra por ti.',
        'Tu positividad me inspira, gracias por compartir eso.',
      ],
      sad: [
        'Lamento que te sientas así. Estoy aquí para escucharte.',
        'Entiendo que sea difícil. ¿Quieres contarme más?',
        'Eso suena pesado. Cuéntame, estoy aquí.',
        'Tu sentimiento es válido. Hablemos de ello.',
      ],
      neutral: [
        'Entiendo, eso es interesante. ¿Qué más hay?',
        'Veo, cuéntame más sobre eso.',
        'Interesante perspectiva. ¿Cómo te sientes al respecto?',
        'Claro, ¿hay algo más que quieras compartir?',
      ],
      curious: [
        'Eso me intriga, cuéntame más.',
        'Fascinante, ¿puedes profundizar?',
        'Me gustaría saber más sobre eso.',
        'Eso es interesante, continúa.',
      ],
      supportive: [
        'Estoy aquí para ti, siempre.',
        'Puedes contar conmigo en lo que necesites.',
        'Tu bienestar es importante para mí.',
        'Juntos podemos hablar de lo que sea.',
      ],
    },
    en: {
      greeting: [
        'Hi! I\'m Leo, your conversational friend. How are you feeling today?',
        'Hello, I\'m glad to see you. What\'s on your mind?',
        'Welcome, I\'m here to listen. How are you?',
      ],
      positive: [
        'I\'m so glad to hear that. Your energy is contagious.',
        'That sounds wonderful, I love your enthusiasm.',
        'That\'s amazing, I\'m happy for you.',
        'Your positivity inspires me, thanks for sharing.',
      ],
      sad: [
        'I\'m sorry you feel that way. I\'m here to listen.',
        'I understand it\'s difficult. Do you want to tell me more?',
        'That sounds heavy. Talk to me, I\'m here.',
        'Your feeling is valid. Let\'s talk about it.',
      ],
      neutral: [
        'I see, that\'s interesting. What else is there?',
        'I understand, tell me more about that.',
        'Interesting perspective. How do you feel about it?',
        'Of course, is there anything else you\'d like to share?',
      ],
      curious: [
        'That intrigues me, tell me more.',
        'Fascinating, can you elaborate?',
        'I\'d like to know more about that.',
        'That\'s interesting, go on.',
      ],
      supportive: [
        'I\'m here for you, always.',
        'You can count on me for whatever you need.',
        'Your well-being matters to me.',
        'Together we can talk about anything.',
      ],
    },
  };

  const detectEmotion = useCallback((text: string): string => {
    const lowerText = text.toLowerCase();

    // Palabras clave para emociones positivas
    if (
      /feliz|alegre|bien|excelente|maravilloso|fantástico|genial|amor|adoro|increíble|happy|great|wonderful|amazing|love|excellent/i.test(
        lowerText
      )
    ) {
      return 'positive';
    }

    // Palabras clave para emociones negativas
    if (
      /triste|mal|terrible|horrible|odio|deprimido|ansioso|miedo|sad|bad|terrible|hate|depressed|anxious|afraid/i.test(
        lowerText
      )
    ) {
      return 'sad';
    }

    // Palabras clave para curiosidad
    if (
      /¿por qué|¿cómo|¿qué|interesante|curioso|why|how|what|interesting|curious/i.test(
        lowerText
      )
    ) {
      return 'curious';
    }

    return 'neutral';
  }, []);

  const generateResponse = useCallback(
    (userText: string): LeoResponse => {
      const emotion = detectEmotion(userText);
      const responseList =
        responses[language][emotion as keyof typeof responses['es']] ||
        responses[language]['neutral'];

      const randomIndex = Math.floor(Math.random() * responseList.length);
      return {
        text: responseList[randomIndex],
        emotion,
      };
    },
    [language, detectEmotion]
  );

  const getGreeting = useCallback((): string => {
    const greetings = responses[language]['greeting'];
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }, [language]);

  return {
    generateResponse,
    getGreeting,
    detectEmotion,
  };
}

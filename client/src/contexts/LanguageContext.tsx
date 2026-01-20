import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    'app.title': 'Diálogos',
    'app.subtitle': 'Conversaciones con Leo',
    'chat.placeholder': 'Escribe algo o usa el micrófono...',
    'chat.send': 'Enviar',
    'chat.listen': 'Escuchar',
    'chat.speak': 'Hablar',
    'chat.stop': 'Detener',
    'chat.language': 'Idioma',
    'chat.spanish': 'Español',
    'chat.english': 'English',
    'chat.clear': 'Limpiar chat',
    'chat.empty': 'Inicia una conversación con Leo...',
    'leo.greeting': '¡Hola! Soy Leo, tu amigo conversacional. ¿Cómo te sientes hoy?',
    'leo.listening': 'Te estoy escuchando...',
    'leo.thinking': 'Pensando...',
    'error.microphone': 'No se pudo acceder al micrófono',
    'error.speech': 'Error en el reconocimiento de voz',
    'error.tts': 'Error en la síntesis de voz',
  },
  en: {
    'app.title': 'Dialogues',
    'app.subtitle': 'Conversations with Leo',
    'chat.placeholder': 'Type something or use the microphone...',
    'chat.send': 'Send',
    'chat.listen': 'Listen',
    'chat.speak': 'Speak',
    'chat.stop': 'Stop',
    'chat.language': 'Language',
    'chat.spanish': 'Español',
    'chat.english': 'English',
    'chat.clear': 'Clear chat',
    'chat.empty': 'Start a conversation with Leo...',
    'leo.greeting': 'Hi! I\'m Leo, your conversational friend. How are you feeling today?',
    'leo.listening': 'I\'m listening to you...',
    'leo.thinking': 'Thinking...',
    'error.microphone': 'Could not access the microphone',
    'error.speech': 'Speech recognition error',
    'error.tts': 'Text-to-speech error',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Cargar idioma guardado o usar el del navegador
    const saved = localStorage.getItem('dialogos-language') as Language | null;
    if (saved) return saved;
    
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'es' ? 'es' : 'en') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dialogos-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

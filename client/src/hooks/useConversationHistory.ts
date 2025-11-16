import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  sender: 'user' | 'leo';
  text: string;
  timestamp: number;
  emotion?: string;
}

const STORAGE_KEY = 'dialogos-conversation-history';

export function useConversationHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar historial al iniciar
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Guardar historial cuando cambie
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving conversation history:', error);
      }
    }
  }, [messages, isLoading]);

  // Agregar mensaje
  const addMessage = useCallback((sender: 'user' | 'leo', text: string, emotion?: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      text,
      timestamp: Date.now(),
      emotion,
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Obtener último mensaje del usuario
  const getLastUserMessage = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  return {
    messages,
    isLoading,
    addMessage,
    clearHistory,
    getLastUserMessage,
  };
}

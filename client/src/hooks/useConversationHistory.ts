import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { memoryService } from '@/lib/memoryService';
import { trpc } from '@/lib/trpc';
import type { PersonalInfo, Conversation, UserMemory } from '@/lib/supabase';
import { ONBOARDING_QUESTIONS, ONBOARDING_COMPLETE_MESSAGE } from '@/lib/onboardingQuestions';

export interface Message {
  id: string;
  sender: 'user' | 'leo';
  text: string;
  timestamp: number;
  emotion?: string;
}

export function useConversationHistory() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Record<string, string>>({});

  // Initialize conversation when user logs in
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    initializeConversation();
  }, [user]);

  const initializeConversation = async () => {
    if (!user) return;

    try {
      // Check if this is the user's first conversation
      const conversationCount = await memoryService.getConversationCount(user.id);
      
      if (conversationCount === 0) {
        // First time user - start onboarding
        setIsOnboarding(true);
        setOnboardingStep(0);
        
        // Create first conversation
        const conversation = await memoryService.createConversation(user.id, 'Onboarding');
        if (conversation) {
          setCurrentConversationId(conversation.id);
          
          // Add first onboarding question
          const firstQuestion = ONBOARDING_QUESTIONS[0];
          addMessage('leo', firstQuestion.question);
        }
      } else {
        // Existing user - load or create main conversation using tRPC
        // Note: user.id from Supabase Auth is a UUID string, but we need the numeric user ID
        // For now, we'll use memoryService directly since it works with Supabase UUIDs
        const existingConversation = await memoryService.getOrCreateMainConversation(user.id);
        if (existingConversation) {
          setCurrentConversationId(existingConversation.id);
          
          // Load previous messages
          const previousMessages = await memoryService.getConversationMessages(existingConversation.id);
          if (previousMessages && previousMessages.length > 0) {
            const formattedMessages: Message[] = previousMessages.map((msg: any) => ({
              id: msg.id,
              sender: msg.role === 'assistant' ? 'leo' : 'user',
              text: msg.content,
              timestamp: new Date(msg.created_at).getTime(),
              emotion: msg.emotion,
            }));
            setMessages(formattedMessages);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add message
  const addMessage = useCallback((sender: 'user' | 'leo', text: string, emotion?: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      text,
      timestamp: Date.now(),
      emotion,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Save to Supabase if we have a conversation
    if (currentConversationId && user) {
      memoryService.saveMessage(
        currentConversationId,
        sender === 'leo' ? 'assistant' : 'user',
        text,
        emotion
      );
    }

    return newMessage;
  }, [currentConversationId, user]);

  // Handle onboarding response
  const handleOnboardingResponse = useCallback(async (userResponse: string) => {
    if (!user || !isOnboarding) return;

    const currentQuestion = ONBOARDING_QUESTIONS[onboardingStep];
    
    // Save the response
    const dataKey = currentQuestion.key;
    const updatedData = { ...onboardingData, [dataKey]: userResponse };
    setOnboardingData(updatedData);

    // Save to database
    await memoryService.savePersonalInfo(
      user.id,
      currentQuestion.infoType,
      currentQuestion.key,
      userResponse,
      0.9, // High confidence since it's direct user input
      currentConversationId || undefined
    );

    // Move to next question or complete onboarding
    if (onboardingStep < ONBOARDING_QUESTIONS.length - 1) {
      const nextStep = onboardingStep + 1;
      setOnboardingStep(nextStep);
      
      // Get next question and replace {nombre} placeholder if needed
      let nextQuestion = ONBOARDING_QUESTIONS[nextStep].question;
      if (updatedData.nombre) {
        nextQuestion = nextQuestion.replace('{nombre}', updatedData.nombre);
      }
      
      // Add next question after a short delay
      setTimeout(() => {
        addMessage('leo', nextQuestion);
      }, 500);
    } else {
      // Onboarding complete
      setIsOnboarding(false);
      
      // Add completion message
      setTimeout(() => {
        addMessage('leo', ONBOARDING_COMPLETE_MESSAGE);
      }, 500);
    }
  }, [user, isOnboarding, onboardingStep, onboardingData, currentConversationId, addMessage]);

  // Clear history
  const clearHistory = useCallback(async () => {
    setMessages([]);
    
    // Create new conversation
    if (user) {
      const conversation = await memoryService.createConversation(user.id);
      if (conversation) {
        setCurrentConversationId(conversation.id);
      }
    }
  }, [user]);

  // Get last user message
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
    isOnboarding,
    onboardingStep,
    handleOnboardingResponse,
    currentConversationId,
  };
}

import { useEffect, useRef } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatInput } from '@/components/ChatInput';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useLeoResponses } from '@/hooks/useLeoResponses';
import { useSpeech } from '@/hooks/useSpeech';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { messages, addMessage, clearHistory, isLoading } = useConversationHistory();
  const { generateResponse, getGreeting } = useLeoResponses();
  const { isListening, isSpeaking, transcript, setTranscript, startListening, stopListening, speak, stopSpeaking } = useSpeech();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Agregar saludo inicial si no hay mensajes
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      const greeting = getGreeting();
      addMessage('leo', greeting);
    }
  }, [isLoading, messages.length, getGreeting, addMessage]);

  // Actualizar el input cuando hay transcripción
  useEffect(() => {
    if (transcript) {
      setTranscript(transcript);
    }
  }, [transcript, setTranscript]);

  const handleSendMessage = async () => {
    const messageText = transcript.trim() || inputRef.current?.value.trim();
    if (!messageText) return;

    // Agregar mensaje del usuario
    addMessage('user', messageText);
    setTranscript('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Simular pequeño delay para que parezca natural
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generar respuesta de Leo
    const response = generateResponse(messageText);
    addMessage('leo', response.text, response.emotion);

    // Hablar la respuesta de Leo
    speak(response.text);
  };

  const handleStartListening = () => {
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que deseas limpiar el historial de conversación?')) {
      clearHistory();
      const greeting = getGreeting();
      addMessage('leo', greeting);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">💬</div>
          <p className="text-muted-foreground">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader onClearHistory={handleClearHistory} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground text-center">{t('chat.empty')}</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                onSpeak={message.sender === 'leo' ? handleSpeak : undefined}
                isSpeaking={isSpeaking && message.sender === 'leo'}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        value={transcript}
        onChange={setTranscript}
        onSend={handleSendMessage}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        isListening={isListening}
        placeholder={t('chat.placeholder')}
      />
    </div>
  );
}

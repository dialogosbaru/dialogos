import { useEffect, useRef } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatInput } from '@/components/ChatInput';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useSpeech } from '@/hooks/useSpeech';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

export default function Home() {
  const { messages, addMessage, clearHistory, isLoading } = useConversationHistory();
  const { isListening, isSpeaking, transcript, setTranscript, startListening, stopListening, speak, stopSpeaking } = useSpeech();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Usar la mutación de tRPC para obtener respuestas de Gemini
  const { mutate: sendMessageToGemini, isPending: isGeminiLoading } = trpc.chat.message.useMutation({
    onSuccess: (response) => {
      // Agregar respuesta de Leo
      addMessage('leo', response.text);
      
      // Hablar la respuesta de Leo
      if (window.speechSynthesis) {
        speak(response.text);
      }
    },
    onError: (error) => {
      console.error('Error getting response from Gemini:', error);
      addMessage('leo', 'Disculpa, tuve un problema procesando tu mensaje. Intenta de nuevo.');
    },
  });

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Agregar saludo inicial si no hay mensajes
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      addMessage('leo', '¡Hola! Soy Leo, tu amigo conversacional. ¿Cómo te sientes hoy?');
    }
  }, [isLoading, messages.length, addMessage]);

  // Actualizar el input cuando hay transcripción
  useEffect(() => {
    if (transcript) {
      setTranscript(transcript);
    }
  }, [transcript, setTranscript]);

  const handleSendMessage = async () => {
    const messageText = transcript.trim() || inputRef.current?.value.trim();
    if (!messageText) return;

    try {
      // Agregar mensaje del usuario
      addMessage('user', messageText);
      setTranscript('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      // Obtener nivel urbano de localStorage (predeterminado 50%)
      const urbanLevel = parseInt(localStorage.getItem('urbanLevel') || '50', 10);
      console.log('Sending message with urbanLevel:', urbanLevel);

      // Enviar a Gemini API a través de tRPC
      sendMessageToGemini({
        message: messageText,
        conversationHistory: messages,
        urbanLevel: urbanLevel,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
      addMessage('leo', '¡Hola! Soy Leo, tu amigo conversacional. ¿Cómo te sientes hoy?');
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
          {isGeminiLoading && (
            <div className="flex gap-3 mb-4">
              <div className="bg-card text-card-foreground rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
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
        isSending={isGeminiLoading}
        placeholder={t('chat.placeholder')}
      />
    </div>
  );
}

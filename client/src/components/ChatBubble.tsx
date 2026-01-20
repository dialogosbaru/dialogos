import { Message } from '@/hooks/useConversationHistory';
import { cn } from '@/lib/utils';
import { Volume2 } from 'lucide-react';
import { Button } from './ui/button';

interface ChatBubbleProps {
  message: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function ChatBubble({ message, onSpeak, isSpeaking }: ChatBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground border border-border rounded-bl-none'
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message.text}</p>

        {!isUser && onSpeak && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeak(message.text)}
              className="h-7 w-7 p-0"
              title="Escuchar respuesta"
            >
              <Volume2
                className={cn(
                  'h-4 w-4',
                  isSpeaking ? 'animate-pulse text-primary' : ''
                )}
              />
            </Button>
            <span className="text-xs opacity-60">
              {isSpeaking ? 'Reproduciendo...' : 'Escuchar'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

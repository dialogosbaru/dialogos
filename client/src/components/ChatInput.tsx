import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
  isSending?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStartListening,
  onStopListening,
  isListening,
  isSending = false,
  placeholder = 'Escribe algo o usa el micrófono...',
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="flex gap-2 items-end">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isListening || isSending}
          className="flex-1 rounded-full border-border focus-visible:ring-primary"
        />

        <Button
          onClick={isListening ? onStopListening : onStartListening}
          variant={isListening ? 'destructive' : 'outline'}
          size="icon"
          className={cn(
            'rounded-full transition-all',
            isListening && 'animate-pulse'
          )}
          title={isListening ? 'Detener grabación' : 'Iniciar grabación'}
        >
          {isListening ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <Button
          onClick={onSend}
          disabled={!value.trim() || isSending || isListening}
          size="icon"
          className="rounded-full"
          title="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trash2 } from 'lucide-react';
import { APP_TITLE } from '@/const';
import OptionsPanel from '@/components/OptionsPanel';

interface ChatHeaderProps {
  onClearHistory?: () => void;
}

export function ChatHeader({ onClearHistory }: ChatHeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{APP_TITLE}</h1>
          <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <OptionsPanel
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />

          {onClearHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="gap-2"
              title={t('chat.clear')}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('chat.clear')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

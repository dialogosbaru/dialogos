import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, LogOut, User, BarChart3, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import { APP_TITLE } from '@/const';
import OptionsPanel from '@/components/OptionsPanel';
import { toast } from 'sonner';

interface ChatHeaderProps {
  onClearHistory?: () => void;
}

export function ChatHeader({ onClearHistory }: ChatHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { signOut, user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada correctamente');
  };

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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/analytics')}
            className="gap-2"
            title="Panel de Análisis Emocional"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Análisis</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/logros')}
            className="gap-2"
            title="Mis Logros"
          >
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Logros</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/perfil')}
            className="gap-2"
            title="Mi perfil"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

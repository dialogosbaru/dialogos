import { LifeBuoy } from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

interface EmergencyButtonProps {
  onClick: () => void;
}

export function EmergencyButton({ onClick }: EmergencyButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          onClick={onClick}
          aria-label="Ayuda de emergencia"
        >
          <LifeBuoy className="h-6 w-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[200px]">
        <p className="text-sm font-medium">¿Necesitas ayuda ahora?</p>
        <p className="text-xs text-muted-foreground mt-1">
          Acceso rápido a recursos de ayuda profesional
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

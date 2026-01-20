import { AlertTriangle, Phone, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface EmergencyResource {
  name: string;
  number: string;
  description: string;
}

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  resources: EmergencyResource[];
  severity: 'critical' | 'high' | 'medium';
}

export function EmergencyModal({
  open,
  onOpenChange,
  title,
  message,
  resources,
  severity,
}: EmergencyModalProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleCallClick = (number: string) => {
    // On mobile, this will open the phone dialer
    window.location.href = `tel:${number.replace(/\s/g, '')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className={`h-6 w-6 ${getSeverityColor()}`} />
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {resource.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resource.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  className="shrink-0"
                  onClick={() => handleCallClick(resource.number)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
              </div>
              <div className="flex items-center gap-2 text-lg font-mono font-semibold text-primary">
                <Phone className="h-4 w-4" />
                {resource.number}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Si estás en peligro inmediato, llama al <strong>123</strong> (emergencias)
            o acude al centro de salud más cercano.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4 mr-2" />
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

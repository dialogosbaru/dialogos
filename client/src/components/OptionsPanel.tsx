import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings } from "lucide-react";
import { colorPalettes, applyColorPalette, getPaletteById } from "@/lib/colorPalettes";
import type { Language } from "@/contexts/LanguageContext";

interface OptionsPanelProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function OptionsPanel({ currentLanguage, onLanguageChange }: OptionsPanelProps) {
  const [selectedPalette, setSelectedPalette] = useState<string>("beige-cream");
  const [open, setOpen] = useState(false);

  // Load saved palette from localStorage on mount
  useEffect(() => {
    const savedPalette = localStorage.getItem("colorPalette");
    if (savedPalette) {
      setSelectedPalette(savedPalette);
      const palette = getPaletteById(savedPalette);
      if (palette) {
        applyColorPalette(palette);
      }
    }
  }, []);

  const handlePaletteChange = (paletteId: string) => {
    setSelectedPalette(paletteId);
    const palette = getPaletteById(paletteId);
    if (palette) {
      applyColorPalette(palette);
      localStorage.setItem("colorPalette", paletteId);
    }
  };

  const handleLanguageChange = (language: string) => {
    onLanguageChange(language as Language);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Opciones</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Opciones</DialogTitle>
          <DialogDescription>
            Personaliza tu experiencia con Diálogos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Idioma</Label>
            <RadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="es" id="lang-es" />
                <Label htmlFor="lang-es" className="cursor-pointer">
                  Español
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="lang-en" />
                <Label htmlFor="lang-en" className="cursor-pointer">
                  English
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Color Palette Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Paleta de Colores</Label>
            <RadioGroup value={selectedPalette} onValueChange={handlePaletteChange}>
              <div className="grid gap-3">
                {colorPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem value={palette.id} id={`palette-${palette.id}`} className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor={`palette-${palette.id}`}
                        className="cursor-pointer font-medium"
                      >
                        {palette.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {palette.description}
                      </p>
                      {/* Color preview */}
                      <div className="flex gap-1 mt-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: `hsl(${palette.colors.primary})`,
                          }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: `hsl(${palette.colors.secondary})`,
                          }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: `hsl(${palette.colors.accent})`,
                          }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{
                            backgroundColor: `hsl(${palette.colors.background})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

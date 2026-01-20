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
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";
import { colorPalettes, applyColorPalette, getPaletteById } from "@/lib/colorPalettes";
import type { Language } from "@/contexts/LanguageContext";
import { AVAILABLE_VOICES, DEFAULT_VOICE, getVoiceById } from "@shared/voiceConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";

interface OptionsPanelProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function OptionsPanel({ currentLanguage, onLanguageChange }: OptionsPanelProps) {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useUserPreferences();
  const [selectedPalette, setSelectedPalette] = useState<string>("beige-cream");
  const [urbanLevel, setUrbanLevel] = useState<number>(50);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(DEFAULT_VOICE.id);
  const [open, setOpen] = useState(false);

  // Load preferences from Supabase or localStorage
  useEffect(() => {
    if (preferences) {
      // Load from Supabase
      setSelectedPalette(preferences.color_palette);
      setUrbanLevel(preferences.urban_level);
      setSelectedVoiceId(preferences.voice_name);
      
      const palette = getPaletteById(preferences.color_palette);
      if (palette) {
        applyColorPalette(palette);
      }
    } else if (!user) {
      // Load from localStorage for non-authenticated users
      const savedPalette = localStorage.getItem("colorPalette");
      if (savedPalette) {
        setSelectedPalette(savedPalette);
        const palette = getPaletteById(savedPalette);
        if (palette) {
          applyColorPalette(palette);
        }
      }
      
      const savedUrbanLevel = localStorage.getItem("urbanLevel");
      if (savedUrbanLevel) {
        setUrbanLevel(parseInt(savedUrbanLevel, 10));
      }

      const savedVoiceId = localStorage.getItem("selectedVoiceId");
      if (savedVoiceId) {
        setSelectedVoiceId(savedVoiceId);
      }
    }
  }, [preferences, user]);

  const handlePaletteChange = (paletteId: string) => {
    setSelectedPalette(paletteId);
    const palette = getPaletteById(paletteId);
    if (palette) {
      applyColorPalette(palette);
      
      if (user) {
        updatePreferences({ color_palette: paletteId });
      } else {
        localStorage.setItem("colorPalette", paletteId);
      }
    }
  };

  const handleLanguageChange = (language: string) => {
    onLanguageChange(language as Language);
  };

  const handleUrbanLevelChange = (value: number[]) => {
    const newLevel = value[0];
    setUrbanLevel(newLevel);
    
    if (user) {
      updatePreferences({ urban_level: newLevel });
    } else {
      localStorage.setItem("urbanLevel", newLevel.toString());
    }
  };

  const getUrbanLevelLabel = (level: number): string => {
    if (level === 0) return "Formal";
    if (level <= 25) return "Poco urbano";
    if (level <= 50) return "Moderado";
    if (level <= 75) return "Urbano";
    return "Muy urbano";
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    
    const voice = getVoiceById(voiceId);
    if (voice && user) {
      updatePreferences({
        voice_name: voice.name,
        voice_region: 'es-US', // Default region
      });
    } else {
      localStorage.setItem("selectedVoiceId", voiceId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Opciones</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border-2 shadow-2xl">
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

          {/* Voice Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Voz de Leo</Label>
            <Select value={selectedVoiceId} onValueChange={handleVoiceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una voz" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.label}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Elige la voz que prefieras para Leo (Gemini-TTS)
            </p>
          </div>

          {/* Urban Language Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Nivel de Lenguaje Urbano</Label>
              <span className="text-sm font-medium text-muted-foreground">
                {urbanLevel}% - {getUrbanLevelLabel(urbanLevel)}
              </span>
            </div>
            <div className="space-y-2">
              <Slider
                value={[urbanLevel]}
                onValueChange={handleUrbanLevelChange}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Ajusta qué tan urbano y coloquial quieres que Leo te hable
              </p>
            </div>
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
                      <div className="flex gap-2 mt-2">
                        <div
                          className="w-10 h-10 rounded-md border-2 shadow-md"
                          style={{
                            backgroundColor: `oklch(${palette.colors.primary})`,
                            borderColor: "rgba(0, 0, 0, 0.2)",
                          }}
                          title="Primary"
                        />
                        <div
                          className="w-10 h-10 rounded-md border-2 shadow-md"
                          style={{
                            backgroundColor: `oklch(${palette.colors.secondary})`,
                            borderColor: "rgba(0, 0, 0, 0.2)",
                          }}
                          title="Secondary"
                        />
                        <div
                          className="w-10 h-10 rounded-md border-2 shadow-md"
                          style={{
                            backgroundColor: `oklch(${palette.colors.accent})`,
                            borderColor: "rgba(0, 0, 0, 0.2)",
                          }}
                          title="Accent"
                        />
                        <div
                          className="w-10 h-10 rounded-md border-2 shadow-md"
                          style={{
                            backgroundColor: `oklch(${palette.colors.background})`,
                            borderColor: "rgba(0, 0, 0, 0.2)",
                          }}
                          title="Background"
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

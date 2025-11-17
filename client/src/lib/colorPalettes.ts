export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const colorPalettes: ColorPalette[] = [
  {
    id: "beige-cream",
    name: "Beige & Crema",
    description: "Paleta cálida y acogedora (predeterminada)",
    colors: {
      background: "30 20% 96%",
      foreground: "30 10% 20%",
      card: "30 20% 98%",
      cardForeground: "30 10% 20%",
      popover: "30 20% 98%",
      popoverForeground: "30 10% 20%",
      primary: "30 40% 65%",
      primaryForeground: "30 10% 10%",
      secondary: "30 15% 88%",
      secondaryForeground: "30 10% 20%",
      muted: "30 15% 92%",
      mutedForeground: "30 10% 45%",
      accent: "30 30% 85%",
      accentForeground: "30 10% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "30 20% 85%",
      input: "30 20% 85%",
      ring: "30 40% 65%",
    },
  },
  {
    id: "sage-green",
    name: "Verde Salvia",
    description: "Tranquilo y natural",
    colors: {
      background: "140 20% 96%",
      foreground: "140 15% 20%",
      card: "140 20% 98%",
      cardForeground: "140 15% 20%",
      popover: "140 20% 98%",
      popoverForeground: "140 15% 20%",
      primary: "140 35% 55%",
      primaryForeground: "0 0% 100%",
      secondary: "140 15% 88%",
      secondaryForeground: "140 15% 20%",
      muted: "140 15% 92%",
      mutedForeground: "140 15% 45%",
      accent: "140 25% 85%",
      accentForeground: "140 15% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "140 20% 85%",
      input: "140 20% 85%",
      ring: "140 35% 55%",
    },
  },
  {
    id: "lavender-purple",
    name: "Lavanda",
    description: "Suave y relajante",
    colors: {
      background: "270 25% 96%",
      foreground: "270 15% 20%",
      card: "270 25% 98%",
      cardForeground: "270 15% 20%",
      popover: "270 25% 98%",
      popoverForeground: "270 15% 20%",
      primary: "270 40% 65%",
      primaryForeground: "0 0% 100%",
      secondary: "270 20% 88%",
      secondaryForeground: "270 15% 20%",
      muted: "270 20% 92%",
      mutedForeground: "270 15% 45%",
      accent: "270 30% 85%",
      accentForeground: "270 15% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "270 25% 85%",
      input: "270 25% 85%",
      ring: "270 40% 65%",
    },
  },
  {
    id: "peach-coral",
    name: "Durazno & Coral",
    description: "Cálido y energizante",
    colors: {
      background: "15 30% 96%",
      foreground: "15 15% 20%",
      card: "15 30% 98%",
      cardForeground: "15 15% 20%",
      popover: "15 30% 98%",
      popoverForeground: "15 15% 20%",
      primary: "15 70% 65%",
      primaryForeground: "0 0% 100%",
      secondary: "15 25% 88%",
      secondaryForeground: "15 15% 20%",
      muted: "15 25% 92%",
      mutedForeground: "15 15% 45%",
      accent: "15 40% 85%",
      accentForeground: "15 15% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "15 30% 85%",
      input: "15 30% 85%",
      ring: "15 70% 65%",
    },
  },
  {
    id: "sky-blue",
    name: "Azul Cielo",
    description: "Fresco y sereno",
    colors: {
      background: "200 25% 96%",
      foreground: "200 15% 20%",
      card: "200 25% 98%",
      cardForeground: "200 15% 20%",
      popover: "200 25% 98%",
      popoverForeground: "200 15% 20%",
      primary: "200 60% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "200 20% 88%",
      secondaryForeground: "200 15% 20%",
      muted: "200 20% 92%",
      mutedForeground: "200 15% 45%",
      accent: "200 30% 85%",
      accentForeground: "200 15% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "200 25% 85%",
      input: "200 25% 85%",
      ring: "200 60% 60%",
    },
  },
  {
    id: "rose-pink",
    name: "Rosa Suave",
    description: "Delicado y acogedor",
    colors: {
      background: "340 30% 96%",
      foreground: "340 15% 20%",
      card: "340 30% 98%",
      cardForeground: "340 15% 20%",
      popover: "340 30% 98%",
      popoverForeground: "340 15% 20%",
      primary: "340 60% 65%",
      primaryForeground: "0 0% 100%",
      secondary: "340 25% 88%",
      secondaryForeground: "340 15% 20%",
      muted: "340 25% 92%",
      mutedForeground: "340 15% 45%",
      accent: "340 35% 85%",
      accentForeground: "340 15% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "340 30% 85%",
      input: "340 30% 85%",
      ring: "340 60% 65%",
    },
  },
  {
    id: "mint-green",
    name: "Verde Menta",
    description: "Refrescante y moderno",
    colors: {
      background: "160 25% 96%",
      foreground: "160 15% 20%",
      card: "160 25% 98%",
      cardForeground: "160 15% 20%",
      popover: "160 25% 98%",
      popoverForeground: "160 15% 20%",
      primary: "160 50% 55%",
      primaryForeground: "0 0% 100%",
      secondary: "160 20% 88%",
      secondaryForeground: "160 15% 20%",
      muted: "160 20% 92%",
      mutedForeground: "160 15% 45%",
      accent: "160 30% 85%",
      accentForeground: "160 15% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "160 25% 85%",
      input: "160 25% 85%",
      ring: "160 50% 55%",
    },
  },
  {
    id: "warm-gray",
    name: "Gris Cálido",
    description: "Elegante y minimalista",
    colors: {
      background: "30 10% 96%",
      foreground: "30 10% 20%",
      card: "30 10% 98%",
      cardForeground: "30 10% 20%",
      popover: "30 10% 98%",
      popoverForeground: "30 10% 20%",
      primary: "30 15% 45%",
      primaryForeground: "0 0% 100%",
      secondary: "30 10% 88%",
      secondaryForeground: "30 10% 20%",
      muted: "30 10% 92%",
      mutedForeground: "30 10% 45%",
      accent: "30 15% 85%",
      accentForeground: "30 10% 20%",
      destructive: "0 65% 55%",
      destructiveForeground: "0 0% 98%",
      border: "30 10% 85%",
      input: "30 10% 85%",
      ring: "30 15% 45%",
    },
  },
];

export function applyColorPalette(palette: ColorPalette) {
  const root = document.documentElement;
  Object.entries(palette.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

export function getPaletteById(id: string): ColorPalette | undefined {
  return colorPalettes.find((p) => p.id === id);
}

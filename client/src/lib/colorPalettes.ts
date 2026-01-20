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
      background: "0.96 0.01 85",
      foreground: "0.25 0.01 85",
      card: "0.98 0.01 85",
      cardForeground: "0.25 0.01 85",
      popover: "0.98 0.01 85",
      popoverForeground: "0.25 0.01 85",
      primary: "0.72 0.08 70",
      primaryForeground: "0.98 0.01 85",
      secondary: "0.88 0.03 85",
      secondaryForeground: "0.25 0.01 85",
      muted: "0.92 0.02 85",
      mutedForeground: "0.50 0.02 85",
      accent: "0.85 0.05 70",
      accentForeground: "0.25 0.01 85",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 85",
      border: "0.85 0.03 85",
      input: "0.85 0.03 85",
      ring: "0.72 0.08 70",
    },
  },
  {
    id: "sage-green",
    name: "Verde Salvia",
    description: "Tranquilo y natural",
    colors: {
      background: "0.96 0.01 140",
      foreground: "0.25 0.03 140",
      card: "0.98 0.01 140",
      cardForeground: "0.25 0.03 140",
      popover: "0.98 0.01 140",
      popoverForeground: "0.25 0.03 140",
      primary: "0.60 0.10 140",
      primaryForeground: "0.98 0.01 140",
      secondary: "0.88 0.03 140",
      secondaryForeground: "0.25 0.03 140",
      muted: "0.92 0.02 140",
      mutedForeground: "0.50 0.05 140",
      accent: "0.85 0.06 140",
      accentForeground: "0.25 0.03 140",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 140",
      border: "0.85 0.04 140",
      input: "0.85 0.04 140",
      ring: "0.60 0.10 140",
    },
  },
  {
    id: "lavender",
    name: "Lavanda",
    description: "Suave y relajante",
    colors: {
      background: "0.96 0.01 280",
      foreground: "0.25 0.03 280",
      card: "0.98 0.01 280",
      cardForeground: "0.25 0.03 280",
      popover: "0.98 0.01 280",
      popoverForeground: "0.25 0.03 280",
      primary: "0.65 0.12 280",
      primaryForeground: "0.98 0.01 280",
      secondary: "0.88 0.03 280",
      secondaryForeground: "0.25 0.03 280",
      muted: "0.92 0.02 280",
      mutedForeground: "0.50 0.06 280",
      accent: "0.85 0.08 280",
      accentForeground: "0.25 0.03 280",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 280",
      border: "0.85 0.04 280",
      input: "0.85 0.04 280",
      ring: "0.65 0.12 280",
    },
  },
  {
    id: "peach-coral",
    name: "Durazno & Coral",
    description: "Cálido y energizante",
    colors: {
      background: "0.96 0.01 40",
      foreground: "0.25 0.03 40",
      card: "0.98 0.01 40",
      cardForeground: "0.25 0.03 40",
      popover: "0.98 0.01 40",
      popoverForeground: "0.25 0.03 40",
      primary: "0.70 0.12 40",
      primaryForeground: "0.98 0.01 40",
      secondary: "0.88 0.03 40",
      secondaryForeground: "0.25 0.03 40",
      muted: "0.92 0.02 40",
      mutedForeground: "0.50 0.06 40",
      accent: "0.85 0.08 40",
      accentForeground: "0.25 0.03 40",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 40",
      border: "0.85 0.04 40",
      input: "0.85 0.04 40",
      ring: "0.70 0.12 40",
    },
  },
  {
    id: "sky-blue",
    name: "Azul Cielo",
    description: "Fresco y sereno",
    colors: {
      background: "0.96 0.01 220",
      foreground: "0.25 0.03 220",
      card: "0.98 0.01 220",
      cardForeground: "0.25 0.03 220",
      popover: "0.98 0.01 220",
      popoverForeground: "0.25 0.03 220",
      primary: "0.62 0.14 220",
      primaryForeground: "0.98 0.01 220",
      secondary: "0.88 0.03 220",
      secondaryForeground: "0.25 0.03 220",
      muted: "0.92 0.02 220",
      mutedForeground: "0.50 0.07 220",
      accent: "0.85 0.08 220",
      accentForeground: "0.25 0.03 220",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 220",
      border: "0.85 0.04 220",
      input: "0.85 0.04 220",
      ring: "0.62 0.14 220",
    },
  },
  {
    id: "soft-pink",
    name: "Rosa Suave",
    description: "Delicado y acogedor",
    colors: {
      background: "0.96 0.01 350",
      foreground: "0.25 0.03 350",
      card: "0.98 0.01 350",
      cardForeground: "0.25 0.03 350",
      popover: "0.98 0.01 350",
      popoverForeground: "0.25 0.03 350",
      primary: "0.68 0.12 350",
      primaryForeground: "0.98 0.01 350",
      secondary: "0.88 0.03 350",
      secondaryForeground: "0.25 0.03 350",
      muted: "0.92 0.02 350",
      mutedForeground: "0.50 0.06 350",
      accent: "0.85 0.08 350",
      accentForeground: "0.25 0.03 350",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 350",
      border: "0.85 0.04 350",
      input: "0.85 0.04 350",
      ring: "0.68 0.12 350",
    },
  },
  {
    id: "mint-green",
    name: "Verde Menta",
    description: "Refrescante y vibrante",
    colors: {
      background: "0.96 0.01 160",
      foreground: "0.25 0.03 160",
      card: "0.98 0.01 160",
      cardForeground: "0.25 0.03 160",
      popover: "0.98 0.01 160",
      popoverForeground: "0.25 0.03 160",
      primary: "0.65 0.12 160",
      primaryForeground: "0.98 0.01 160",
      secondary: "0.88 0.03 160",
      secondaryForeground: "0.25 0.03 160",
      muted: "0.92 0.02 160",
      mutedForeground: "0.50 0.06 160",
      accent: "0.85 0.08 160",
      accentForeground: "0.25 0.03 160",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 160",
      border: "0.85 0.04 160",
      input: "0.85 0.04 160",
      ring: "0.65 0.12 160",
    },
  },
  {
    id: "warm-gray",
    name: "Gris Cálido",
    description: "Elegante y minimalista",
    colors: {
      background: "0.96 0.01 60",
      foreground: "0.25 0.02 60",
      card: "0.98 0.01 60",
      cardForeground: "0.25 0.02 60",
      popover: "0.98 0.01 60",
      popoverForeground: "0.25 0.02 60",
      primary: "0.50 0.03 60",
      primaryForeground: "0.98 0.01 60",
      secondary: "0.88 0.02 60",
      secondaryForeground: "0.25 0.02 60",
      muted: "0.92 0.01 60",
      mutedForeground: "0.50 0.03 60",
      accent: "0.85 0.03 60",
      accentForeground: "0.25 0.02 60",
      destructive: "0.55 0.20 25",
      destructiveForeground: "0.98 0.01 60",
      border: "0.85 0.02 60",
      input: "0.85 0.02 60",
      ring: "0.50 0.03 60",
    },
  },
];

export function applyColorPalette(palette: ColorPalette) {
  const root = document.documentElement;
  
  // Add transition class for smooth color changes
  root.classList.add('palette-transitioning');
  
  Object.entries(palette.colors).forEach(([key, value]) => {
    // Convert key from camelCase to kebab-case
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    // Wrap OKLCH values with oklch() function
    root.style.setProperty(`--${cssVarName}`, `oklch(${value})`);
  });
  
  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('palette-transitioning');
  }, 500);
}

export function getPaletteById(id: string): ColorPalette | undefined {
  return colorPalettes.find((p) => p.id === id);
}

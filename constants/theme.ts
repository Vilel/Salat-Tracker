import { Platform } from "react-native";

// Paleta inspirada en "Modern Islamic Minimalist"
const palette = {
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    400: "#34d399",
    500: "#10b981",
    600: "#059669", // Primary Light
    800: "#065f46", // Primary Dark
    900: "#064e3b",
  },
  gold: {
    500: "#eab308", // Secondary / Accent
    600: "#ca8a04",
  },
  sand: {
    50: "#fdf8f6", // Background Light Alt
    100: "#f5e6e0",
  },
  midnight: {
    800: "#1e293b",
    900: "#0f172a", // Background Dark
    950: "#020617",
  },
  slate: {
    50: "#f8fafc", // Background Light
    100: "#f1f5f9",
    200: "#e2e8f0", // Border Light
    500: "#64748b", // Text Muted
    700: "#334155",
    800: "#1e293b", // Border Dark
    900: "#0f172a", // Text Dark
  },
};

export const Colors = {
  light: {
    text: palette.midnight[900],
    textMuted: palette.slate[500],
    background: palette.slate[50], // Un blanco roto muy sutil
    card: "#ffffff",
    border: palette.slate[200],
    primary: palette.emerald[600],
    primarySoft: palette.emerald[100],
    accent: palette.gold[600],
    success: palette.emerald[500],
    error: "#ef4444",
  },
  dark: {
    text: palette.slate[100],
    textMuted: palette.slate[500],
    background: palette.midnight[950],
    card: palette.midnight[900],
    border: palette.slate[800],
    primary: palette.emerald[500], // Un poco más brillante para dark mode
    primarySoft: palette.emerald[900],
    accent: palette.gold[500],
    success: palette.emerald[400],
    error: "#f87171",
  },
} as const;

export type ColorSchemeName = keyof typeof Colors;

// 👇 tipo “tema” reutilizable (light | dark)
export type AppTheme = (typeof Colors)[ColorSchemeName];

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  android: {
    // En Android lo más estándar es Roboto, pero "normal" ya apunta ahí
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

// Escala de tamaños pensada para personas mayores
export const FontSizes = {
  xxs: 12,  // para numeraciones pequeñas (reloj, badges)
  xs: 14,
  sm: 16,
  base: 18,   // tamaño “normal” de texto
  lg: 20,
  xl: 22,
  "2xl": 26,
  "3xl": 32,
};

// Tema específico para el reloj analógico
export const ClockTheme: Record<
  ColorSchemeName,
  {
    bezel: string;
    faceBg: string;
    nightOverlay: string;
    hourHand: string;
    minuteHand: string;
    center: string;
    sun: string;
    moon: string;
    shadow: string;
  }
> = {
  light: {
    bezel: palette.midnight[900],
    faceBg: "#ffffff",
    nightOverlay: "rgba(15, 23, 42, 0.6)", 
    hourHand: palette.midnight[900],
    minuteHand: palette.midnight[900],
    center: palette.emerald[600],
    sun: palette.gold[500],
    moon: palette.midnight[800],
    shadow: palette.midnight[900],
  },
  dark: {
    bezel: "#ffffff",
    faceBg: palette.midnight[900],
    nightOverlay: "rgba(15, 23, 42, 0.8)",
    hourHand: palette.slate[100],
    minuteHand: palette.slate[100],
    center: palette.emerald[500],
    sun: palette.gold[500],
    moon: palette.emerald[200], // Luna sutil verdosa
    shadow: "#000000",
  },
};

// Colores de franjas para cada rezo (reutilizables en otros componentes)
// DEPRECATED: Use PrayerThemeContext instead for dynamic colors
export const PrayerStripeColors: Record<
  ColorSchemeName,
  Record<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha", string>
> = {
  light: {
    fajr: "#0ea5e9",   // amanecer
    dhuhr: "#eab308",  // mediodía
    asr: "#f97316",    // tarde
    maghrib: "#a855f7",// atardecer
    isha: "#1e40af",   // noche
  },
  dark: {
    fajr: "#22d3ee",
    dhuhr: "#facc15",
    asr: "#fb923c",
    maghrib: "#c4b5fd",
    isha: "#60a5fa",
  },
};

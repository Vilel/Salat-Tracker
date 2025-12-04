// constants/theme.ts
import { Platform } from "react-native";

const primaryLight = "#166534"; // verde profundo (accesible)
const primaryDark = "#4ade80";  // verde suave para dark
const bgLight = "#f9fafb";      // gris muy claro
const bgDark = "#020617";       // casi negro

export const Colors = {
  light: {
    text: "#111827",          // slate-900
    textMuted: "#6b7280",     // slate-500
    background: bgLight,
    card: "#ffffff",
    border: "#e5e7eb",
    primary: primaryLight,
    primarySoft: "#bbf7d0",   // verde muy suave para chips
    accent: "#f97316",        // naranja para acentos
  },
  dark: {
    text: "#e5e7eb",
    textMuted: "#9ca3af",
    background: bgDark,
    card: "#020617",
    border: "#1f2937",
    primary: primaryDark,
    primarySoft: "#052e16",
    accent: "#fb923c",
  },
};

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
  xs: 14,
  sm: 16,
  base: 18,   // tamaño “normal” de texto
  lg: 20,
  xl: 22,
  "2xl": 26,
  "3xl": 32,
};

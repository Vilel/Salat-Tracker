const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rutas a todos los archivos que usan clases Tailwind/NativeWind
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        neutral: colors.gray,
        // Semantic tokens aligned with `constants/theme.ts` (Colors.light / Colors.dark)
        // Usage examples:
        // - bg-app-background-light / bg-app-background-dark
        // - text-app-text-light / text-app-text-dark
        // - border-app-border-light / border-app-border-dark
        app: {
          text: {
            light: "#0f172a", // Colors.light.text (midnight 900)
            dark: "#f1f5f9", // Colors.dark.text (slate 100)
          },
          textMuted: {
            light: "#475569", // Colors.light.textMuted (slate 600)
            dark: "#64748b", // Colors.dark.textMuted (slate 500)
          },
          background: {
            light: "#f8fafc", // Colors.light.background (slate 50)
            dark: "#020617", // Colors.dark.background (midnight 950)
          },
          card: {
            light: "#ffffff", // Colors.light.card
            dark: "#0f172a", // Colors.dark.card (midnight 900)
          },
          border: {
            light: "#e2e8f0", // Colors.light.border (slate 200)
            dark: "#1e293b", // Colors.dark.border (slate 800)
          },
          primary: {
            light: "#065f46", // Colors.light.primary (emerald 800)
            dark: "#10b981", // Colors.dark.primary (emerald 500)
          },
          primarySoft: {
            light: "#d1fae5", // Colors.light.primarySoft (emerald 100)
            dark: "#064e3b", // Colors.dark.primarySoft (emerald 900)
          },
          accent: {
            light: "#ca8a04", // Colors.light.accent (gold 600)
            dark: "#eab308", // Colors.dark.accent (gold 500)
          },
          success: {
            light: "#10b981", // Colors.light.success (emerald 500)
            dark: "#34d399", // Colors.dark.success (emerald 400)
          },
          error: {
            light: "#ef4444", // Colors.light.error
            dark: "#f87171", // Colors.dark.error
          },
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
}
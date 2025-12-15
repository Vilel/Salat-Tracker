import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Tipos de colores por rezo
export type PrayerColors = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

// Colores por defecto (tomados de theme.ts)
const DEFAULT_COLORS: PrayerColors = {
  fajr: "#0ea5e9", // Light mode default
  dhuhr: "#eab308",
  asr: "#f97316",
  maghrib: "#a855f7",
  isha: "#1e40af",
};

const DEFAULT_COLORS_DARK: PrayerColors = {
  fajr: "#22d3ee",
  dhuhr: "#facc15",
  asr: "#fb923c",
  maghrib: "#c4b5fd",
  isha: "#60a5fa",
};

interface PrayerThemeContextType {
  colors: PrayerColors;
  setColors: (colors: PrayerColors) => Promise<void>;
  resetColors: () => Promise<void>;
  updateColor: (prayer: keyof PrayerColors, color: string) => Promise<void>;
}

const PrayerThemeContext = createContext<PrayerThemeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@prayer_theme_colors";

export function PrayerThemeProvider({
  children,
  colorScheme = "light",
}: {
  children: React.ReactNode;
  colorScheme?: "light" | "dark";
}) {
  const [colors, setColorsState] = useState<PrayerColors>(
    colorScheme === "dark" ? DEFAULT_COLORS_DARK : DEFAULT_COLORS
  );

  // Cargar colores guardados al iniciar
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setColorsState(JSON.parse(stored));
        } else {
            // Si no hay nada guardado, usar defaults segun el esquema actual
            setColorsState(colorScheme === "dark" ? DEFAULT_COLORS_DARK : DEFAULT_COLORS);
        }
      } catch (e) {
        console.warn("Failed to load prayer theme", e);
      }
    })();
  }, []); // Solo al montar, luego sync manual si cambia esquema drásticamente podría ser necesario pero por ahora simple.

  // Efecto para sincronizar defaults si cambia el esquema y no hay override guardado (opcional, por simplicidad mantenemos persistencia explicita)
  // Por ahora: si el usuario personaliza, esos colores mandan. Si quiere resetear, puede hacerlo.

  const setColors = async (newColors: PrayerColors) => {
    setColorsState(newColors);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
  };

  const updateColor = async (prayer: keyof PrayerColors, color: string) => {
    const newColors = { ...colors, [prayer]: color };
    await setColors(newColors);
  };

  const resetColors = async () => {
    const defaults = colorScheme === "dark" ? DEFAULT_COLORS_DARK : DEFAULT_COLORS;
    setColorsState(defaults);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PrayerThemeContext.Provider value={{ colors, setColors, resetColors, updateColor }}>
      {children}
    </PrayerThemeContext.Provider>
  );
}

export function usePrayerTheme() {
  const context = useContext(PrayerThemeContext);
  if (!context) {
    throw new Error("usePrayerTheme must be used within a PrayerThemeProvider");
  }
  return context;
}


// hooks/use-color-scheme.ts
import { useColorScheme as useNWColorScheme } from "nativewind";
import { useColorScheme as useRNColorScheme } from "react-native";

type AppColorScheme = "light" | "dark" | null;

/**
 * NativeWind uses class-based dark mode (tailwind.config.js: darkMode: "class").
 * This hook must read from NativeWind to avoid mismatches (e.g. inside Modal/portal trees).
 */
export function useColorScheme(): AppColorScheme {
  const { colorScheme } = useNWColorScheme();
  const systemScheme = useRNColorScheme();

  if (colorScheme === "light" || colorScheme === "dark") {
    return colorScheme;
  }

  if (systemScheme === "light" || systemScheme === "dark") {
    return systemScheme;
  }

  return null;
}

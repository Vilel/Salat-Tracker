// hooks/use-color-scheme.web.ts
import { useColorScheme as useNWColorScheme } from "nativewind";
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from "react-native";

type AppColorScheme = "light" | "dark" | null;

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme(): AppColorScheme {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const { colorScheme } = useNWColorScheme();
  const systemScheme = useRNColorScheme();
  const normalized: AppColorScheme =
    colorScheme === "dark" || colorScheme === "light" ? colorScheme : null;

  if (hasHydrated) {
    if (normalized) {
      return normalized;
    }

    if (systemScheme === "light" || systemScheme === "dark") {
      return systemScheme;
    }

    return null;
  }

  return 'light';
}

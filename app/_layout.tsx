import { BottomNav } from "@/components/BottomNav";
import { Colors } from "@/constants/theme";
import { LanguageProvider } from "@/contexts/language-context";
import { PrayerThemeProvider } from "@/contexts/prayer-theme-context";
import { PrayerTimesProvider } from "@/contexts/prayer-times-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";
import "../globals.css";

/**
 * Component that initializes and manages notification listeners.
 * Uses the dedicated hook to keep the layout clean.
 */
function NotificationManager() {
  useNotificationListener();
  return null;
}

export default function RootLayout() {
  const rawScheme = useColorScheme();
  const colorScheme = rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const containerClassName =
    colorScheme === "dark"
      ? "flex-1 bg-app-background-dark"
      : "flex-1 bg-app-background-light";

  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const combinedTheme = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      background: theme.background, // Sincronizar fondo de navegación con nuestro tema
    },
  };

  return (
    <LanguageProvider>
      <PrayerThemeProvider colorScheme={colorScheme}>
        <PrayerTimesProvider>
          <NotificationManager />
          <ThemeProvider value={combinedTheme}>
            <View className={containerClassName}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                {/* index.tsx será la pantalla principal automáticamente */}
                {/* app/locations.tsx se registra como /locations */}
              </Stack>

              {/* Barra de navegación inferior compartida */}
              <BottomNav />

              <StatusBar style="auto" />
            </View>
          </ThemeProvider>
        </PrayerTimesProvider>
      </PrayerThemeProvider>
    </LanguageProvider>
  );
}

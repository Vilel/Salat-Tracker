// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";
import "../globals.css";

import { BottomNav } from "@/components/BottomNav";
import { LanguageProvider } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* index.tsx será la pantalla principal automáticamente */}
            {/* app/locations.tsx se registra como /locations */}
          </Stack>

          {/* Barra de navegación inferior compartida */}
          <BottomNav />

          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </LanguageProvider>
  );
}

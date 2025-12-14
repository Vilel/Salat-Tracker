import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import "../globals.css";

import { BottomNav } from "@/components/BottomNav";
import { Colors } from "@/constants/theme";
import { LanguageProvider } from "@/contexts/language-context";
import { PrayerThemeProvider } from "@/contexts/prayer-theme-context";
import { PrayerTimesProvider } from "@/contexts/prayer-times-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initNotifications, isExpoGo } from "@/lib/notifications";

function NotificationManager() {
  const router = useRouter();

  useEffect(() => {
    let responseSubscription: { remove: () => void } | null = null;
    let receivedSubscription: { remove: () => void } | null = null;

    (async () => {
      // In Expo Go we skip notification wiring entirely to avoid crashes/limitations.
      if (isExpoGo()) return;

      await initNotifications();

      const Notifications = await import("expo-notifications");
      const openAlarmIfNeeded = (
        data:
          | { type?: string; prayerName?: string }
          | undefined
          | null
      ) => {
        if (data?.type === "prayer_alarm" && data?.prayerName) {
          router.push({
            pathname: "/alarm",
            params: { prayerName: data.prayerName },
          });
        }
      };

      // If user taps the notification (background/lock screen -> opens app)
      responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data as
            | { type?: string; prayerName?: string }
            | undefined;
          openAlarmIfNeeded(data);
        }
      );

      // If app is foreground when alarm fires, open the alarm screen immediately.
      receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          const data = notification.request.content.data as
            | { type?: string; prayerName?: string }
            | undefined;
          openAlarmIfNeeded(data);
        }
      );
    })();

    return () => {
      responseSubscription?.remove();
      receivedSubscription?.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

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
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.background },
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

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Vibration,
  View,
} from "react-native";

import { ThemedText } from "@/components/ui/ThemedText";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { width } = Dimensions.get("window");
const SWIPE_WIDTH = width - 64;
const BUTTON_SIZE = 56;
const MAX_SWIPE = SWIPE_WIDTH - BUTTON_SIZE - 8;

export default function AlarmScreen() {
  const { prayerName } = useLocalSearchParams<{ prayerName: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { t } = useLanguage();

  // Animación de swipe
  const pan = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  // Vibración en bucle
  useEffect(() => {
    // Patrón: espera 0ms, vibra 500ms, espera 500ms...
    const INTERVAL_MS = 1000;
    Vibration.vibrate([0, 500, 500], true); // true = repetir

    return () => {
      Vibration.cancel();
    };
  }, []);

  const dismiss = () => {
    Vibration.cancel();
    setSwiped(true);
    // Navegar a inicio después de una breve pausa
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }, 300);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= MAX_SWIPE) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > MAX_SWIPE * 0.7) {
          // Si deslizó más del 70%, completar
          Animated.spring(pan, {
            toValue: MAX_SWIPE,
            useNativeDriver: false,
          }).start(dismiss);
        } else {
          // Si no, volver al inicio
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const translatedPrayerName =
    prayerName && typeof prayerName === "string"
      ? t.prayers[prayerName as keyof typeof t.prayers] || prayerName
      : "";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 80,
      }}
    >
      <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
        <View style={{ marginBottom: 32, padding: 24, borderRadius: 9999, backgroundColor: theme.primary + "30" }}>
          <Ionicons name="notifications" size={64} color={theme.primary} />
        </View>

        <ThemedText variant="title" style={{ fontSize: 32, marginBottom: 8 }}>
          {t.prayerInfo.timeForPrayer}
        </ThemedText>

        <ThemedText
          variant="default"
          color={theme.primary}
          style={{ fontSize: 40, fontWeight: "800", textTransform: "capitalize" }}
        >
          {translatedPrayerName}
        </ThemedText>
      </View>

      {/* Swipe to Dismiss */}
      <View style={{ width: "100%", paddingHorizontal: 32 }}>
        <View
          style={{
            height: BUTTON_SIZE + 16,
            backgroundColor: theme.card,
            borderRadius: 100,
            justifyContent: "center",
            padding: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
            position: "relative",
          }}
        >
          <View style={{ position: "absolute", width: "100%", alignItems: "center" }}>
            <ThemedText
              style={{
                color: theme.textMuted,
                fontWeight: "600",
                letterSpacing: 1,
                opacity: swiped ? 0 : 0.5,
              }}
            >
              {swiped ? "" : t.alarm.swipeToDismiss.toUpperCase()}
            </ThemedText>
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={{
              transform: [{ translateX: pan }],
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: BUTTON_SIZE / 2,
              backgroundColor: theme.primary,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Ionicons name="chevron-forward" size={32} color="white" />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

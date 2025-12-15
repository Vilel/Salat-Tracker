import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    PanResponder,
    Pressable,
    Vibration,
    View,
} from "react-native";

import { ScreenHeader, ScreenLayout, ThemedText } from "@/components/ui";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { width } = Dimensions.get("window");
const SWIPE_WIDTH = width - 64;
const BUTTON_SIZE = 56;
const MAX_SWIPE = SWIPE_WIDTH - BUTTON_SIZE - 8;

// Auto-dismiss after 5 minutes to preserve battery
const AUTO_DISMISS_MS = 5 * 60 * 1000;

// Vibration pattern: more attention-grabbing
const VIBRATION_PATTERN = [0, 500, 200, 500, 200, 500, 1000];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AlarmScreen() {
  const { prayerName } = useLocalSearchParams<{ prayerName: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  const primaryBgClass = isDark ? "bg-app-primary-dark" : "bg-app-primary-light";
  const primaryTextClass = isDark
    ? "text-app-primary-dark"
    : "text-app-primary-light";
  const { t } = useLanguage();

  // Current time display (updates every second)
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  
  // Swipe animation
  const pan = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  
  // Pulse animation for icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const dismiss = useCallback(() => {
    if (swiped) return; // Prevent double dismiss
    Vibration.cancel();
    setSwiped(true);
    // Navigate after brief pause for animation
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }, 300);
  }, [router, swiped]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Vibration loop
  useEffect(() => {
    Vibration.vibrate(VIBRATION_PATTERN, true);
    return () => {
      Vibration.cancel();
    };
  }, []);

  // Pulse animation for the icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Auto-dismiss timer (preserve battery)
  useEffect(() => {
    const timeout = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [dismiss]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !swiped,
        onMoveShouldSetPanResponder: () => !swiped,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx > 0 && gestureState.dx <= MAX_SWIPE) {
            pan.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > MAX_SWIPE * 0.7) {
            // Swiped past threshold - complete the action
            Animated.spring(pan, {
              toValue: MAX_SWIPE,
              useNativeDriver: false,
            }).start(dismiss);
          } else {
            // Not enough - spring back
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [pan, dismiss, swiped]
  );

  const translatedPrayerName =
    prayerName && typeof prayerName === "string"
      ? t.prayers[prayerName as keyof typeof t.prayers] || prayerName
      : t.prayerInfo.timeForPrayer;

  return (
    <ScreenLayout scrollable={false} padding={false}>
      <View
        className={[
          "flex-1 items-center justify-between px-6 py-[60px]",
          isDark ? "bg-app-background-dark" : "bg-app-background-light",
        ].join(" ")}
      >
        {/* Current Time */}
        <View className="items-center pt-5">
          <ThemedText
            className={["text-[48px] font-extralight tracking-[2px]", mutedTextClass].join(" ")}
          >
            {currentTime}
          </ThemedText>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center">
          <ScreenHeader
            title={t.prayerInfo.timeForPrayer}
            subtitle={t.alarm.subtitle}
            className="mt-0 mb-5"
          />

          {/* Animated Icon */}
          <Animated.View
            className={[
              "mb-6 rounded-full p-7",
              isDark ? "bg-app-primary-dark/15" : "bg-app-primary-light/10",
            ].join(" ")}
            style={{ transform: [{ scale: pulseAnim }] }}
          >
            <Ionicons name="notifications" size={72} color={theme.primary} />
          </Animated.View>

          <ThemedText
            variant="default"
            className={["text-[44px] leading-[52px] font-extrabold capitalize text-center", primaryTextClass].join(" ")}
          >
            {translatedPrayerName}
          </ThemedText>
        </View>

        {/* Bottom Controls */}
        <View className="w-full gap-4">
          {/* Swipe to Dismiss */}
          <View
            className={[
              "relative h-[72px] w-full justify-center rounded-full p-2 shadow-lg",
              isDark ? "bg-app-card-dark" : "bg-app-card-light",
            ].join(" ")}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={t.alarm.subtitle}
          >
            <View
              className="absolute w-full items-center"
            >
              <ThemedText
                className={[
                  "text-[12px] font-semibold tracking-[1px]",
                  mutedTextClass,
                  swiped ? "opacity-0" : "opacity-50",
                ].join(" ")}
              >
                {swiped ? "" : t.alarm.swipeToDismiss.toUpperCase()}
              </ThemedText>
            </View>

            <Animated.View
              {...panResponder.panHandlers}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={t.alarm.swipeToDismiss}
              className={["z-10 h-14 w-14 items-center justify-center rounded-full", primaryBgClass].join(" ")}
              style={{ transform: [{ translateX: pan }] }}
            >
              <Ionicons name="chevron-forward" size={32} color="white" />
            </Animated.View>
          </View>

          {/* Alternative tap to dismiss button */}
          <Pressable
            onPress={dismiss}
            disabled={swiped}
            accessibilityRole="button"
            accessibilityLabel={t.alarm.subtitle}
            hitSlop={10}
            className={["items-center py-3", swiped ? "opacity-0" : "opacity-80", "active:opacity-50"].join(" ")}
          >
            <ThemedText
              className={["text-[14px] font-semibold", mutedTextClass].join(" ")}
            >
              {t.alarm.swipeToDismiss}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
}

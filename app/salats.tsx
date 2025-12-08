// app/salats.tsx

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Colors,
  FontSizes,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { PrayerName } from "@/lib/prayer-times";

import {
  computeDayStats,
  createEmptyDayStatus,
  getDateKey,
  loadTracker,
  PRAYER_ORDER,
  RAKATS,
  saveTracker,
  togglePrayerForDate,
  type DayStatus,
  type TrackerStore,
} from "@/lib/salat-tracker";

type WeeklyHistoryDay = {
  key: string;
  dayLabel: string;
  progress: number; // 0–1
  isToday: boolean;
};

function getDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "narrow" });
}

export default function SalatsScreen() {
  const { t } = useLanguage();
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const [tracker, setTracker] = useState<TrackerStore>({});
  const [loading, setLoading] = useState(true);

  const backgroundStyle = { backgroundColor: theme.background };

  const cardStyle = {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  };

  const todayKey = getDateKey(new Date());

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const stored = await loadTracker();
      if (!isMounted) return;
      setTracker(stored);
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const todayStatus: DayStatus =
    tracker[todayKey] ?? createEmptyDayStatus();

  const {
    totalRakats,
    doneRakats,
    donePrayersCount,
    completionPercentage,
    remainingRakats,
  } = computeDayStats(todayStatus);

  const handleToggleTodayPrayer = (name: PrayerName) => {
    setTracker((prev) => {
      const updated = togglePrayerForDate(prev, todayKey, name);
      saveTracker(updated);
      return updated;
    });
  };

  const weeklyHistory = useMemo<WeeklyHistoryDay[]>(() => {
    const days: WeeklyHistoryDay[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = getDateKey(d);

      const status: DayStatus =
        tracker[k] ?? createEmptyDayStatus();

      const { completionPercentage } = computeDayStats(status);
      const progress = completionPercentage / 100;

      days.push({
        key: k,
        dayLabel: getDayLabel(k),
        progress,
        isToday: k === todayKey,
      });
    }

    return days;
  }, [tracker, todayKey]);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={backgroundStyle}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={backgroundStyle}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER (sin icono a la derecha) */}
        <View className="mb-6 mt-2">
          <Text
            className="font-extrabold"
            style={{
              fontSize: 28,
              color: theme.text,
              letterSpacing: -0.5,
            }}
          >
            {t.mySalats.title}
          </Text>
          <Text
            style={{
              fontSize: FontSizes.sm,
              color: theme.textMuted,
              marginTop: 4,
            }}
          >
            {t.mySalats.subtitle}
          </Text>
        </View>

        {/* HERO CARD: RESUMEN DE HOY */}
        <View style={cardStyle} className="p-5 mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text
                className="text-sm font-semibold uppercase opacity-60"
                style={{ color: theme.text }}
              >
                {t.mySalats.todaySummary}
              </Text>
              <Text
                className="text-4xl font-black mt-1"
                style={{ color: theme.text }}
              >
                {completionPercentage}%
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: theme.textMuted }}
              >
                {t.mySalats.todaySummaryHint}
              </Text>
            </View>

            <View className="items-end">
              <View className="flex-row items-baseline">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: theme.primary }}
                >
                  {doneRakats}
                </Text>
                <Text
                  className="text-sm font-medium ml-1"
                  style={{ color: theme.textMuted }}
                >
                  / {totalRakats}
                </Text>
              </View>
              <Text
                className="text-xs"
                style={{ color: theme.textMuted }}
              >
                Rak‘ats
              </Text>

              <Text
                className="text-xs mt-1"
                style={{ color: theme.textMuted }}
              >
                {remainingRakats} {t.mySalats.pendingRakatsLabel}
              </Text>
            </View>
          </View>

          {/* Barra de Progreso Segmentada (por número de salats completados) */}
          <View className="flex-row gap-1.5 h-3 mt-2">
            {[1, 2, 3, 4, 5].map((_, index) => {
              const isFilled = index < donePrayersCount;
              return (
                <View
                  key={index}
                  className="flex-1 rounded-full"
                  style={{
                    backgroundColor: isFilled
                      ? theme.primary
                      : theme.border,
                    opacity: isFilled ? 1 : 0.3,
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* LISTA DE REZOS DE HOY EN UNA SOLA CARD */}
        <View style={cardStyle} className="p-5 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="font-bold"
              style={{ fontSize: FontSizes.lg, color: theme.text }}
            >
              {t.mySalats.todayPrayers}
            </Text>
            <Text
              style={{
                fontSize: FontSizes.xs,
                color: theme.textMuted,
              }}
            >
              {donePrayersCount} / {PRAYER_ORDER.length}
            </Text>
          </View>

          <View>
            {PRAYER_ORDER.map((name, index) => {
              const done = todayStatus[name];
              const rakats = RAKATS[name];
              const label = t.prayers[name];

              return (
                <View key={name}>
                  <TouchableOpacity
                    onPress={() => handleToggleTodayPrayer(name)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between"
                    style={{ paddingVertical: 8 }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: done
                            ? theme.primary
                            : theme.background,
                          borderWidth: done ? 0 : 1,
                          borderColor: done
                            ? theme.primary
                            : theme.border,
                        }}
                      >
                        <Ionicons
                          name={
                            done ? "checkmark" : "ellipse-outline"
                          }
                          size={20}
                          color={done ? "#fff" : theme.textMuted}
                        />
                      </View>

                      <View>
                        <Text
                          className="font-bold capitalize"
                          style={{
                            fontSize: FontSizes.base,
                            color: theme.text,
                            opacity: done ? 0.5 : 1,
                            textDecorationLine: done
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {label}
                        </Text>
                        <Text
                          style={{
                            fontSize: FontSizes.xs,
                            color: theme.textMuted,
                          }}
                        >
                          {rakats} rak‘ats
                        </Text>
                      </View>
                    </View>

                    {done && (
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: theme.primary + "20",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: theme.primary,
                          }}
                        >
                          {t.mySalats.statusDone.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {index < PRAYER_ORDER.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.border,
                        marginVertical: 6,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* GRÁFICO DE BARRAS SEMANAL (últimos 7 días) */}
        <View style={cardStyle} className="p-5">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text
                className="font-bold text-base"
                style={{ color: theme.text }}
              >
                {t.mySalats.historyTitle}
              </Text>
              <Text
                className="text-xs opacity-60"
                style={{ color: theme.textMuted }}
              >
                {t.mySalats.historySubtitle}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-end h-32">
            {weeklyHistory.map((day) => {
              const barHeightPct = Math.max(
                day.progress * 100,
                5
              );

              return (
                <View
                  key={day.key}
                  className="items-center flex-1"
                >
                  <View
                    className="w-3 rounded-full relative overflow-hidden"
                    style={{
                      height: `${barHeightPct}%`,
                      backgroundColor: day.isToday
                        ? theme.primary
                        : day.progress > 0
                        ? theme.primary
                        : theme.border,
                      opacity: day.isToday
                        ? 1
                        : day.progress > 0
                        ? 0.4
                        : 0.3,
                    }}
                  />

                  <Text
                    className="mt-2 text-xs font-medium uppercase"
                    style={{
                      color: day.isToday
                        ? theme.primary
                        : theme.textMuted,
                      fontWeight: day.isToday ? "bold" : "normal",
                    }}
                  >
                    {day.dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

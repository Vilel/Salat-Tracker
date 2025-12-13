import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";

import { Card } from "@/components/ui/Card";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { ThemedText } from "@/components/ui/ThemedText";
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
      <ScreenLayout scrollable={false}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER (sin icono a la derecha) */}
      <View className="mb-6 mt-2">
        <ThemedText variant="title" style={{ letterSpacing: -0.5, fontSize: 28 }}>
          {t.mySalats.title}
        </ThemedText>
        <ThemedText variant="default" color={theme.textMuted} className="mt-1">
          {t.mySalats.subtitle}
        </ThemedText>
      </View>

      {/* HERO CARD: RESUMEN DE HOY */}
      <Card className="mb-6">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <ThemedText variant="small" className="font-semibold uppercase opacity-60">
              {t.mySalats.todaySummary}
            </ThemedText>
            <ThemedText
              className="font-black mt-1"
              style={{ fontSize: 36, lineHeight: 40 }}
            >
              {completionPercentage}%
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted} className="mt-1">
              {t.mySalats.todaySummaryHint}
            </ThemedText>
          </View>

          <View className="items-end">
            <View className="flex-row items-baseline">
              <ThemedText
                className="font-bold"
                style={{ fontSize: 24, color: theme.primary }}
              >
                {doneRakats}
              </ThemedText>
              <ThemedText variant="small" className="font-medium ml-1" color={theme.textMuted}>
                / {totalRakats}
              </ThemedText>
            </View>
            <ThemedText variant="small" color={theme.textMuted}>
              Rak‘ats
            </ThemedText>

            <ThemedText variant="small" color={theme.textMuted} className="mt-1">
              {remainingRakats} {t.mySalats.pendingRakatsLabel}
            </ThemedText>
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
      </Card>

      {/* LISTA DE REZOS DE HOY EN UNA SOLA CARD */}
      <Card className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <ThemedText variant="subtitle">
            {t.mySalats.todayPrayers}
          </ThemedText>
          <ThemedText variant="small" color={theme.textMuted}>
            {donePrayersCount} / {PRAYER_ORDER.length}
          </ThemedText>
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
                      <ThemedText
                        variant="default"
                        className="font-bold capitalize"
                        style={{
                          opacity: done ? 0.5 : 1,
                          textDecorationLine: done
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {label}
                      </ThemedText>
                      <ThemedText variant="small" color={theme.textMuted}>
                        {rakats} rak‘ats
                      </ThemedText>
                    </View>
                  </View>

                  {done && (
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: theme.primary + "20",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: theme.primary,
                        }}
                      >
                        {t.mySalats.statusDone.toUpperCase()}
                      </ThemedText>
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
      </Card>

      {/* GRÁFICO DE BARRAS SEMANAL (últimos 7 días) */}
      <Card>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <ThemedText variant="default" className="font-bold">
              {t.mySalats.historyTitle}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted} className="opacity-60">
              {t.mySalats.historySubtitle}
            </ThemedText>
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

                <ThemedText
                  variant="small"
                  className="mt-2 font-medium uppercase"
                  style={{
                    color: day.isToday
                      ? theme.primary
                      : theme.textMuted,
                    fontWeight: day.isToday ? "bold" : "normal",
                    fontSize: 10
                  }}
                >
                  {day.dayLabel}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </Card>
    </ScreenLayout>
  );
}

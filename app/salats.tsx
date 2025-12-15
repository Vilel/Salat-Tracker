import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Card, Divider, ScreenHeader, ScreenLayout } from "@/components/ui";
import {
  Colors,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { toLocaleTag } from "@/lib/locale";
import type { PrayerName } from "@/lib/prayer-times";

import {
  computeDayStats,
  createEmptyDayStatus,
  getDateKey,
  loadTracker,
  PRAYER_ORDER,
  PRAYER_STRUCTURE,
  RAKATS,
  saveTracker,
  togglePrayerForDate,
  type DayStatus,
  type TrackerStore,
} from "@/lib/salat-tracker";

type WeeklyHistoryDay = {
  key: string;
  dayLabel: string;
  progress: number;
  isToday: boolean;
};

function getDayLabel(dateString: string, localeTag: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(localeTag, { weekday: "narrow" });
}

export default function SalatsScreen() {
  const { t, locale } = useLanguage();
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const textClass = isDark ? "text-app-text-dark" : "text-app-text-light";
  const textMutedClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  const primaryBgClass = isDark ? "bg-app-primary-dark" : "bg-app-primary-light";
  const primaryTextClass = isDark
    ? "text-app-primary-dark"
    : "text-app-primary-light";
  const borderBgClass = isDark ? "bg-app-border-dark" : "bg-app-border-light";
  const borderColorClass = isDark
    ? "border-app-border-dark"
    : "border-app-border-light";
  const chartTrackBgClass = isDark
    ? "bg-app-border-dark/40"
    : "bg-app-border-light/60";

  const [tracker, setTracker] = useState<TrackerStore>({});
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

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
    const localeTag = toLocaleTag(locale);

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
        dayLabel: getDayLabel(k, localeTag),
        progress,
        isToday: k === todayKey,
      });
    }

    return days;
  }, [locale, tracker, todayKey]);

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
    <ScreenLayout>
      <View className="pb-10">
        <ScreenHeader
          title={t.mySalats.title}
          subtitle={t.mySalats.subtitle}
          right={
            <Pressable
              onPress={() => setShowInfo(true)}
              accessibilityRole="button"
              accessibilityLabel={t.prayerInfo.title}
              hitSlop={10}
              className={`rounded-full p-2 active:opacity-70 ${isDark ? "bg-app-border-dark" : "bg-app-border-light"}`}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme.primary}
              />
            </Pressable>
          }
        />

        {/* HERO CARD: RESUMEN DE HOY */}
        <View className="mb-6">
          <Card>
            <View className="mb-4 flex-row items-start justify-between">
              <View>
                <Text className={`text-xs font-semibold uppercase opacity-60 ${textMutedClass}`}>
                  {t.mySalats.todaySummary}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.5}
                  className={`mt-1 text-4xl font-black leading-10 ${textClass}`}
                >
                  {completionPercentage}%
                </Text>
                <Text className={`mt-1 text-xs ${textMutedClass}`}>
                  {t.mySalats.todaySummaryHint}
                </Text>
              </View>

              <View className="ml-4 flex-1 items-end">
                <View className="flex-row items-baseline justify-end">
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.5}
                    className={`text-2xl font-bold ${primaryTextClass}`}
                  >
                    {doneRakats}
                  </Text>
                  <Text className={`ml-1 text-xs font-medium ${textMutedClass}`}>
                    / {totalRakats}
                  </Text>
                </View>
                <Text className={`text-xs ${textMutedClass}`}>Rak&apos;ats</Text>

                <Text className={`mt-1 text-xs text-right ${textMutedClass}`}>
                  {remainingRakats} {t.mySalats.pendingRakatsLabel}
                </Text>
              </View>
            </View>

            {/* Barra de Progreso Segmentada */}
            <View className="mt-2 h-3 flex-row gap-1.5">
              {[1, 2, 3, 4, 5].map((_, index) => {
                const isFilled = index < donePrayersCount;
                return (
                  <View
                    key={index}
                    className={`flex-1 rounded-full ${isFilled ? primaryBgClass : borderBgClass} ${isFilled ? "opacity-100" : "opacity-30"}`}
                  />
                );
              })}
            </View>
          </Card>
        </View>

        {/* LISTA DE REZOS DE HOY */}
        <View className="mb-8">
          <Card>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-xl font-semibold ${textClass}`}>
                {t.mySalats.todayPrayers}
              </Text>
              <Text className={`text-xs ${textMutedClass}`}>
                {donePrayersCount} / {PRAYER_ORDER.length}
              </Text>
            </View>

            <View className="mt-2">
              {PRAYER_ORDER.map((name, index) => {
                const done = todayStatus[name];
                const rakats = RAKATS[name];
                const label = t.prayers[name];

                return (
                  <View key={name}>
                    <Pressable
                      onPress={() => handleToggleTodayPrayer(name)}
                      accessibilityRole="button"
                      accessibilityLabel={label}
                      android_ripple={{ color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
                      className="flex-row items-center px-4 py-4 active:opacity-70"
                    >
                      {/* CHECKBOX */}
                      <View
                        className={
                          done
                            ? `mr-4 h-8 w-8 items-center justify-center rounded-full ${primaryBgClass}`
                            : `mr-4 h-8 w-8 items-center justify-center rounded-full border-2 ${borderColorClass}`
                        }
                      >
                        {done ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                      </View>

                      {/* NOMBRE */}
                      <Text
                        numberOfLines={1}
                        className={`flex-1 text-[17px] font-bold ${textClass}`}
                      >
                        {label}
                      </Text>

                      {/* RAKATS */}
                      <View className="flex-row items-center gap-1.5">
                        <Text
                          className={`text-[17px] font-bold ${done ? primaryTextClass : textClass}`}
                        >
                          {rakats}
                        </Text>
                        <Text className={`text-[13px] font-medium ${textMutedClass}`}>
                          {t.prayerInfo.rakats.toLowerCase()}
                        </Text>
                      </View>
                    </Pressable>

                    {index < PRAYER_ORDER.length - 1 ? (
                      <Divider insetClassName="ml-16" />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* GRÁFICO DE BARRAS SEMANAL */}
        <Card>
          <View className="mb-6">
            <Text className={`text-base font-bold ${textClass}`}>
              {t.mySalats.historyTitle}
            </Text>
            <Text className={`mt-1 text-xs opacity-60 ${textMutedClass}`}>
              {t.mySalats.historySubtitle}
            </Text>
          </View>

          <View className="h-40 flex-row items-end justify-between px-2">
            {weeklyHistory.map((day) => {
              const filledSegments = Math.max(0, Math.min(10, Math.ceil(day.progress * 10)));

              return (
                <View
                  key={day.key}
                  className="flex-1 items-center gap-2"
                >
                  <View className={`w-4 min-h-[100px] flex-1 justify-end overflow-hidden rounded-full ${chartTrackBgClass}`}>
                    <View
                      style={{ height: `${day.progress * 100}%` }}
                      className={`w-full rounded-full ${primaryBgClass} ${day.isToday ? "opacity-100" : "opacity-60"}`}
                    />
                  </View>

                  <Text
                    className={`text-[11px] uppercase ${day.isToday ? `${primaryTextClass} font-bold` : `${textMutedClass} font-medium`}`}
                  >
                    {day.dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* MODAL DE INFORMACIÓN */}
        <Modal
          visible={showInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInfo(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-4">
            <View className="w-full max-h-[80%]">
              <Card>
                <View className={`mb-4 flex-row items-center justify-between border-b pb-4 ${borderColorClass}`}>
                  <Text className={`text-xl font-semibold ${textClass}`}>
                    {t.prayerInfo.title}
                  </Text>
                  <Pressable
                    onPress={() => setShowInfo(false)}
                    accessibilityRole="button"
                    accessibilityLabel={t.common.close}
                    hitSlop={10}
                    className="-m-1 p-1 active:opacity-70"
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className={`mb-4 italic ${textMutedClass}`}>
                    {t.prayerInfo.note}
                  </Text>

                  {PRAYER_ORDER.map((prayer) => {
                    const struct = PRAYER_STRUCTURE[prayer];
                    return (
                      <View key={prayer} className="mb-6">
                        <Text className={`mb-2 font-bold capitalize ${primaryTextClass}`}>
                          {t.prayers[prayer]}
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                          {struct.sunnahBefore ? (
                            <Badge
                              label={`${struct.sunnahBefore} ${t.prayerInfo.sunnah}`}
                              type="sunnah"
                              isDark={isDark}
                            />
                          ) : null}

                          <Badge
                            label={`${struct.fard} ${t.prayerInfo.fard}`}
                            type="fard"
                            isDark={isDark}
                          />

                          {struct.sunnahAfter ? (
                            <Badge
                              label={`${struct.sunnahAfter} ${t.prayerInfo.sunnah}`}
                              type="sunnah"
                              isDark={isDark}
                            />
                          ) : null}

                          {struct.witr ? (
                            <Badge
                              label={`${struct.witr} ${t.prayerInfo.witr}`}
                              type="extra"
                              isDark={isDark}
                            />
                          ) : null}

                          {struct.nafl ? (
                            <Badge
                              label={`${struct.nafl} ${t.prayerInfo.nafl}`}
                              type="extra"
                              isDark={isDark}
                            />
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </Card>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenLayout>
  );
}

function Badge({
  label,
  type,
  isDark,
}: {
  label: string;
  type: "fard" | "sunnah" | "extra";
  isDark: boolean;
}) {
  const primaryBg = isDark ? "bg-app-primary-dark" : "bg-app-primary-light";
  const primaryText = isDark ? "text-app-primary-dark" : "text-app-primary-light";
  const extraBg = isDark ? "bg-app-border-dark" : "bg-app-border-light";
  const extraText = isDark ? "text-app-text-dark" : "text-app-text-light";

  return (
    <View
      className={
        type === "fard"
          ? `rounded-lg px-3 py-1.5 ${primaryBg}`
          : type === "sunnah"
          ? `rounded-lg border px-3 py-1.5 ${isDark ? "border-app-primary-dark" : "border-app-primary-light"}`
          : `rounded-lg px-3 py-1.5 ${extraBg}`
      }
    >
      <Text
        numberOfLines={1}
        className={
          type === "fard"
            ? "text-xs font-semibold text-white"
            : type === "sunnah"
            ? `text-xs font-semibold ${primaryText}`
            : `text-xs font-semibold ${extraText}`
        }
      >
        {label}
      </Text>
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Card, ScreenLayout, ThemedText } from "@/components/ui";
import {
  Colors,
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER (con icono de Info a la derecha) */}
      <View style={{ marginBottom: 24, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <ThemedText
            variant="title"
            style={{ letterSpacing: -0.5, fontSize: 28 }}
          >
            {t.mySalats.title}
          </ThemedText>
          <ThemedText variant="default" color={theme.textMuted} style={{ marginTop: 4 }}>
            {t.mySalats.subtitle}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => setShowInfo(true)}
          style={{
            padding: 8,
            borderRadius: 9999,
            backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f1f5f9', // slate-800 / slate-100
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={theme.primary}
          />
        </Pressable>
      </View>

      {/* HERO CARD: RESUMEN DE HOY */}
      <Card style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View>
            <ThemedText variant="small" style={{ fontWeight: '600', textTransform: 'uppercase', opacity: 0.6 }}>
              {t.mySalats.todaySummary}
            </ThemedText>
            <ThemedText
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.5}
              style={{ fontSize: 36, lineHeight: 40, fontWeight: '900', marginTop: 4 }}
            >
              {completionPercentage}%
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted} style={{ marginTop: 4 }}>
              {t.mySalats.todaySummaryHint}
            </ThemedText>
          </View>

          <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end' }}>
              <ThemedText
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.5}
                style={{ fontSize: 24, fontWeight: '700', color: theme.primary }}
              >
                {doneRakats}
              </ThemedText>
              <ThemedText variant="small" style={{ fontWeight: '500', marginLeft: 4 }} color={theme.textMuted}>
                / {totalRakats}
              </ThemedText>
            </View>
            <ThemedText variant="small" color={theme.textMuted}>
              Rak‘ats
            </ThemedText>

            <ThemedText variant="small" color={theme.textMuted} style={{ marginTop: 4, textAlign: 'right' }}>
              {remainingRakats} {t.mySalats.pendingRakatsLabel}
            </ThemedText>
          </View>
        </View>

        {/* Barra de Progreso Segmentada (por número de salats completados) */}
        <View style={{ flexDirection: 'row', gap: 6, height: 12, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((_, index) => {
            const isFilled = index < donePrayersCount;
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  borderRadius: 9999,
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
      <Card style={{ marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
                <Pressable
                  onPress={() => handleToggleTodayPrayer(name)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    opacity: pressed ? 0.7 : 1
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
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

                    <View style={{ flex: 1 }}>
                      <ThemedText
                        variant="default"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: '700',
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
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 9999,
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
                </Pressable>

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
        <View style={{ marginBottom: 24 }}>
          <ThemedText variant="default" style={{ fontWeight: '700' }}>
            {t.mySalats.historyTitle}
          </ThemedText>
          <ThemedText variant="small" color={theme.textMuted} style={{ opacity: 0.6 }}>
            {t.mySalats.historySubtitle}
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingHorizontal: 8 }}>
          {weeklyHistory.map((day) => {
            const barHeightPct = Math.max(day.progress * 100, 0);

            return (
              <View
                key={day.key}
                style={{ alignItems: 'center', flex: 1, gap: 8 }}
              >
                {/* Track de fondo (100% altura) */}
                <View
                  style={{
                    width: 16,
                    borderRadius: 9999,
                    position: 'relative',
                    overflow: 'hidden',
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: rawScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    minHeight: 100,
                  }}
                >
                  {/* Barra de progreso */}
                  <View
                    style={{
                      width: '100%',
                      borderRadius: 9999,
                      height: `${barHeightPct}%`,
                      backgroundColor: day.isToday
                        ? theme.primary
                        : day.progress > 0
                        ? theme.primary
                        : "transparent",
                      opacity: day.isToday ? 1 : 0.6,
                      minHeight: day.progress > 0 ? 8 : 0,
                    }}
                  />
                </View>

                {/* Etiqueta día */}
                <ThemedText
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    color: day.isToday ? theme.primary : theme.textMuted,
                    fontWeight: day.isToday ? "700" : "500",
                    fontSize: 11,
                  }}
                >
                  {day.dayLabel}
                </ThemedText>
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16 }}>
          <Card style={{ width: '100%', maxHeight: '80%' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                borderBottomWidth: 1,
                paddingBottom: 16,
                borderColor: theme.border
              }}
            >
              <ThemedText variant="subtitle">{t.prayerInfo.title}</ThemedText>
              <Pressable onPress={() => setShowInfo(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={{ marginBottom: 16, fontStyle: 'italic' }} color={theme.textMuted}>
                {t.prayerInfo.note}
              </ThemedText>

              {PRAYER_ORDER.map((prayer) => {
                const struct = PRAYER_STRUCTURE[prayer];
                return (
                  <View key={prayer} style={{ marginBottom: 24 }}>
                    <ThemedText
                      variant="default"
                      style={{ fontWeight: '700', textTransform: 'capitalize', marginBottom: 8 }}
                      color={theme.primary}
                    >
                      {t.prayers[prayer]}
                    </ThemedText>

                    {/* Visualización de bloques de rakats */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {struct.sunnahBefore && (
                        <Badge
                          label={`${struct.sunnahBefore} ${t.prayerInfo.sunnah}`}
                          type="sunnah"
                          theme={theme}
                        />
                      )}

                      <Badge
                        label={`${struct.fard} ${t.prayerInfo.fard}`}
                        type="fard"
                        theme={theme}
                      />

                      {struct.sunnahAfter && (
                        <Badge
                          label={`${struct.sunnahAfter} ${t.prayerInfo.sunnah}`}
                          type="sunnah"
                          theme={theme}
                        />
                      )}
                      {struct.witr && (
                        <Badge
                          label={`${struct.witr} ${t.prayerInfo.witr}`}
                          type="extra"
                          theme={theme}
                        />
                      )}
                      {struct.nafl && (
                        <Badge
                          label={`${struct.nafl} ${t.prayerInfo.nafl}`}
                          type="extra"
                          theme={theme}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </Card>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

function Badge({
  label,
  type,
  theme,
}: {
  label: string;
  type: "fard" | "sunnah" | "extra";
  theme: typeof Colors.light;
}) {
  let bg = theme.border;
  let text = theme.text;
  let border = "transparent";

  if (type === "fard") {
    bg = theme.primary;
    text = "#FFFFFF";
  } else if (type === "sunnah") {
    bg = theme.background;
    border = theme.primary;
    text = theme.primary;
  }

  return (
    <View
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
      }}
    >
      <ThemedText style={{ color: text, fontSize: 12, fontWeight: "600" }}>
        {label}
      </ThemedText>
    </View>
  );
}

// app/salats.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Translations } from "@/constants/i18n";
import {
  Colors,
  FontSizes,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { PrayerName } from "@/lib/prayer-times";

const TRACKER_KEY = "@salat_tracker_v1";

const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

const RAKATS: Record<PrayerName, number> = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
};

type DayStatus = Record<PrayerName, boolean>;
type TrackerStore = Record<string, DayStatus>; // dateKey -> status

function createEmptyDayStatus(): DayStatus {
  return {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
}

function getDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDateLabel(
  dateKey: string,
  todayKey: string,
  tMySalats: Translations["mySalats"]
): string {
  if (dateKey === todayKey) return tMySalats.today;

  const date = new Date(dateKey + "T00:00:00");
  const now = new Date(todayKey + "T00:00:00");
  const diff = Math.round(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 1) return tMySalats.yesterday;

  // fallback: fecha corta local
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
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
  const cardBaseStyle = {
    backgroundColor: theme.card,
    borderColor: theme.border,
  };

  const todayKey = getDateKey(new Date());

  // Cargar datos del tracker
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(TRACKER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TrackerStore;
          setTracker(parsed);
        }
      } catch (err) {
        console.warn("Failed to load salat tracker:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayStatus: DayStatus =
    tracker[todayKey] ?? createEmptyDayStatus();

  const totalRakats = useMemo(
    () =>
      PRAYER_ORDER.reduce(
        (sum, name) => sum + RAKATS[name],
        0
      ),
    []
  );

  const doneRakats = useMemo(
    () =>
      PRAYER_ORDER.reduce(
        (sum, name) =>
          sum + (todayStatus[name] ? RAKATS[name] : 0),
        0
      ),
    [todayStatus]
  );

  const pendingRakats = totalRakats - doneRakats;
  const completion = totalRakats
    ? doneRakats / totalRakats
    : 0;

  const handleToggleTodayPrayer = (name: PrayerName) => {
    const newStatus = {
      ...todayStatus,
      [name]: !todayStatus[name],
    };

    setTracker((prev) => {
      const updated: TrackerStore = {
        ...prev,
        [todayKey]: newStatus,
      };
      AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(updated)).catch(
        (err) => console.warn("Failed to save salat tracker:", err)
      );
      return updated;
    });
  };

  // Historial: últimos 7 días anteriores a hoy (solo lectura)
  const historyEntries = useMemo(() => {
    const keys = Object.keys(tracker).filter((k) => k !== todayKey);
    keys.sort().reverse();
    return keys.slice(0, 7).map((dateKey) => ({
      dateKey,
      status: tracker[dateKey] ?? createEmptyDayStatus(),
    }));
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
    <SafeAreaView
      className="flex-1"
      style={backgroundStyle}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 space-y-5">
          {/* HEADER (sin botón atrás) */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 pr-4">
              <Text
                style={{
                  fontSize: FontSizes.lg,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {t.mySalats.title}
              </Text>
              <Text
                style={{
                  fontSize: FontSizes.xs,
                  color: theme.textMuted,
                  marginTop: 2,
                }}
              >
                {t.mySalats.subtitle}
              </Text>
            </View>

            <View
              className="rounded-full items-center justify-center"
              style={{
                width: 40,
                height: 40,
                backgroundColor: theme.primarySoft,
              }}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color={theme.primary}
              />
            </View>
          </View>

          {/* CARD: RESUMEN DE HOY */}
          <View
            className="rounded-3xl border px-4 py-4 shadow-sm"
            style={cardBaseStyle}
          >
            <Text
              className="font-semibold mb-1"
              style={{
                fontSize: FontSizes.sm,
                color: theme.text,
              }}
            >
              {t.mySalats.todaySummary}
            </Text>

            <Text
              style={{
                fontSize: FontSizes.xs,
                color: theme.textMuted,
                marginBottom: 12,
              }}
            >
              {t.mySalats.todaySummaryHint}
            </Text>

            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "800",
                    color: theme.text,
                  }}
                >
                  {pendingRakats}
                </Text>
                <Text
                  style={{
                    fontSize: FontSizes.xs,
                    color: theme.textMuted,
                    marginTop: 2,
                  }}
                >
                  {t.mySalats.pendingRakatsLabel}
                </Text>
              </View>

              <View className="flex-1 ml-6">
                <View
                  className="h-2 rounded-full overflow-hidden"
                  style={{
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(148,163,184,0.3)"
                        : "rgba(226,232,240,1)",
                  }}
                >
                  <View
                    className="h-full"
                    style={{
                      width: `${Math.max(
                        4,
                        Math.min(completion * 100, 100)
                      )}%`,
                      backgroundColor: theme.primary,
                      borderRadius: 999,
                    }}
                  />
                </View>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: FontSizes.xs,
                    color: theme.textMuted,
                  }}
                >
                  {doneRakats}/{totalRakats} rak‘ats
                </Text>
              </View>
            </View>
          </View>

          {/* CARD: REZOS DE HOY (editable) */}
          <View
            className="rounded-3xl border px-4 py-4 shadow-sm"
            style={cardBaseStyle}
          >
            <Text
              className="font-semibold mb-3"
              style={{
                fontSize: FontSizes.sm,
                color: theme.text,
              }}
            >
              {t.mySalats.todayPrayers}
            </Text>

            <View className="space-y-2">
              {PRAYER_ORDER.map((name) => {
                const done = todayStatus[name];
                const rakats = RAKATS[name];
                const label = t.prayers[name];

                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => handleToggleTodayPrayer(name)}
                    className="flex-row items-center justify-between rounded-2xl px-3 py-2"
                    style={{
                      backgroundColor: done
                        ? theme.primarySoft
                        : colorScheme === "dark"
                        ? "rgba(15,23,42,0.9)"
                        : "rgba(248,250,252,1)",
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: done
                            ? theme.primary
                            : theme.primarySoft,
                        }}
                      >
                        <Ionicons
                          name={
                            done
                              ? "checkmark-outline"
                              : "ellipse-outline"
                          }
                          size={18}
                          color={done ? "#ffffff" : theme.primary}
                        />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: FontSizes.sm,
                            fontWeight: "600",
                            color: theme.text,
                          }}
                        >
                          {label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: theme.textMuted,
                            marginTop: 2,
                          }}
                        >
                          {rakats} rak‘ats
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        fontSize: FontSizes.xs,
                        color: done
                          ? theme.primary
                          : theme.textMuted,
                        fontWeight: done ? "600" : "400",
                      }}
                    >
                      {done
                        ? t.mySalats.statusDone
                        : t.mySalats.statusPending}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* CARD: HISTORIAL (solo lectura) */}
          {historyEntries.length > 0 && (
            <View
              className="rounded-3xl border px-4 py-4 shadow-sm mb-2"
              style={cardBaseStyle}
            >
              <Text
                className="font-semibold mb-2"
                style={{
                  fontSize: FontSizes.sm,
                  color: theme.text,
                }}
              >
                {t.mySalats.historyTitle}
              </Text>

              <Text
                style={{
                  fontSize: FontSizes.xs,
                  color: theme.textMuted,
                  marginBottom: 8,
                }}
              >
                {t.mySalats.historySubtitle}
              </Text>

              <View className="space-y-3">
                {historyEntries.map(({ dateKey, status }) => {
                  const label = formatDateLabel(
                    dateKey,
                    todayKey,
                    t.mySalats
                  );
                  const doneCount = PRAYER_ORDER.filter(
                    (n) => status[n]
                  ).length;

                  return (
                    <View
                      key={dateKey}
                      className="flex-row items-center justify-between"
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: FontSizes.sm,
                            fontWeight: "600",
                            color: theme.text,
                          }}
                        >
                          {label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: theme.textMuted,
                            marginTop: 2,
                          }}
                        >
                          {doneCount}/{PRAYER_ORDER.length} salats
                        </Text>
                      </View>

                      <View className="flex-row">
                        {PRAYER_ORDER.map((name) => {
                          const done = status[name];
                          return (
                            <View
                              key={name + dateKey}
                              className="w-6 h-6 rounded-full items-center justify-center ml-1"
                              style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                backgroundColor: done
                                  ? theme.primary
                                  : "transparent",
                              }}
                            >
                              {done && (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color="#ffffff"
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

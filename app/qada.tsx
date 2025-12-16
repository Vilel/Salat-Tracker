import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Button, Card, Chip, Divider, ScreenHeader, ScreenLayout, SectionHeader, ThemedText } from "@/components/ui";
import {
  Colors,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsRTL } from "@/hooks/use-is-rtl";
import { toLocaleTag } from "@/lib/locale";
import type { PrayerName } from "@/lib/prayer-times";

import {
  computeDayStats,
  computeTotalMissedRakats,
  createEmptyDayStatus,
  getDateKey,
  getSortedDateKeys,
  loadQadaCleared,
  loadTracker,
  PRAYER_ORDER,
  RAKATS,
  saveQadaCleared,
  saveTracker,
  togglePrayerForDate,
  type DayStatus,
  type TrackerStore,
} from "@/lib/salat-tracker";

function formatDateLabel(dateKey: string, localeTag: string = "en-US") {
  const date = new Date(dateKey);
  return date.toLocaleDateString(localeTag, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function QadaScreen() {
  const { t, locale } = useLanguage();
  const isRTL = useIsRTL();
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const textClass = isDark ? "text-app-text-dark" : "text-app-text-light";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  const primaryBgClass = isDark ? "bg-app-primary-dark" : "bg-app-primary-light";
  const primaryTextClass = isDark
    ? "text-app-primary-dark"
    : "text-app-primary-light";
  const borderColorClass = isDark
    ? "border-app-border-dark"
    : "border-app-border-light";
  const screenBgClass = isDark
    ? "bg-app-background-dark"
    : "bg-app-background-light";
  const cardBgClass = isDark ? "bg-app-card-dark" : "bg-app-card-light";

  const [tracker, setTracker] = useState<TrackerStore>({});
  const [qadaCleared, setQadaCleared] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingDateKey, setEditingDateKey] = useState<string | null>(null);

  const todayKey = getDateKey(new Date());

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const [storedTracker, storedQada] = await Promise.all([
        loadTracker(),
        loadQadaCleared(),
      ]);

      if (!isMounted) return;

      setTracker(storedTracker);
      setQadaCleared(storedQada);
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalMissed = useMemo(
    () => computeTotalMissedRakats(tracker, todayKey),
    [tracker, todayKey]
  );

  const balance = qadaCleared - totalMissed;
  const absBalance = Math.abs(balance);

  let balanceText = "0";
  let balanceLabel = t.qada.netZeroLabel;
  const balanceTone: "negative" | "positive" | "zero" =
    balance < 0 ? "negative" : balance > 0 ? "positive" : "zero";
  const balanceValueClass =
    balanceTone === "negative"
      ? isDark
        ? "text-red-400"
        : "text-red-600"
      : balanceTone === "positive"
      ? primaryTextClass
      : textClass;

  if (balance < 0) {
    balanceText = `-${absBalance}`;
    balanceLabel = t.qada.netNegativeLabel;
  } else if (balance > 0) {
    balanceText = String(absBalance);
    balanceLabel = t.qada.netPositiveLabel;
  }

  const netPending = Math.max(totalMissed - qadaCleared, 0);

  const historyKeys = useMemo(() => {
    const all = getSortedDateKeys(tracker).filter((k) => k < todayKey);
    return all.sort((a, b) => b.localeCompare(a));
  }, [tracker, todayKey]);

  const handleRegisterQada = async () => {
    const value = Number.parseInt(inputValue, 10);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    const newCleared = qadaCleared + value;
    setQadaCleared(newCleared);
    setInputValue("");
    await saveQadaCleared(newCleared);
  };

  const handleToggleHistoryPrayer = (dateKey: string, prayer: PrayerName) => {
    setTracker((prev) => {
      const updated = togglePrayerForDate(prev, dateKey, prayer);
      saveTracker(updated);
      return updated;
    });
  };

  if (loading) {
    return (
      <ScreenLayout scrollable={false}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  const isButtonDisabled = !inputValue || parseInt(inputValue) <= 0;

  return (
    <ScreenLayout contentContainerClassName="pb-10">
      {/* MODAL DE EDICIÓN DE DÍA - INLINE (SIN SCROLL) */}
      {editingDateKey && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!editingDateKey}
          onRequestClose={() => setEditingDateKey(null)}
        >
          <View className="flex-1 items-center justify-center bg-black/60 px-4">
            <Pressable
              className="absolute inset-0"
              onPress={() => setEditingDateKey(null)}
            />

            <Card
              variant="elevated"
              className="w-full max-w-[400px] overflow-hidden p-0"
            >
              <View
                className={["p-6 pb-4", cardBgClass].join(" ")}
              >
                <ThemedText
                  variant="subtitle"
                  className="mb-1 text-center"
                >
                  {formatDateLabel(editingDateKey, toLocaleTag(locale))}
                </ThemedText>
                <ThemedText
                  variant="small"
                  className={["text-center", mutedTextClass].join(" ")}
                >
                  {t.qada.editDaySubtitle}
                </ThemedText>
              </View>

              <Divider />

              {/* LISTA SIMPLE DE REZOS (Sin ScrollView para evitar amontonamiento) */}
              <View className="py-2">
                {PRAYER_ORDER.map((name, index) => {
                  const dayStatus = tracker[editingDateKey] ?? createEmptyDayStatus();
                  const done = dayStatus[name];
                  const label = t.prayers[name];
                  const rakats = RAKATS[name];

                  return (
                    <View key={name}>
                      <Pressable
                        onPress={() => handleToggleHistoryPrayer(editingDateKey, name)}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        className="flex-row items-center px-5 py-3.5 active:opacity-70"
                      >
                        {/* CHECKBOX */}
                        <View
                          className={[
                            "mr-4 h-6 w-6 items-center justify-center rounded-lg border",
                            done ? `${primaryBgClass} border-transparent` : borderColorClass,
                          ].join(" ")}
                        >
                          {done && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>

                        {/* TEXTO */}
                        <ThemedText
                          className={["flex-1 text-[16px] font-semibold", textClass].join(" ")}
                          numberOfLines={1}
                        >
                          {label}
                        </ThemedText>

                        {/* RAKATS */}
                        <View className="flex-row items-center gap-1.5">
                          <ThemedText
                            className={["text-[16px] font-semibold", done ? primaryTextClass : textClass].join(" ")}
                          >
                            {rakats}
                          </ThemedText>
                          <ThemedText
                            variant="small"
                            className={["text-[12px] font-medium", mutedTextClass].join(" ")}
                          >
                            {t.prayerInfo.rakats.toLowerCase()}
                          </ThemedText>
                        </View>
                      </Pressable>

                      {index < PRAYER_ORDER.length - 1 ? (
                        <Divider insetClassName={isRTL ? "mr-[68px]" : "ml-[68px]"} />
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <Divider />

              <View className={["p-4", cardBgClass].join(" ")}>
                <Button
                  label={t.common.close}
                  onPress={() => setEditingDateKey(null)}
                  variant="outline"
                  size="md"
                />
              </View>
            </Card>
          </View>
        </Modal>
      )}

      <ScreenHeader title={t.qada.title} subtitle={t.qada.subtitle} />

      {/* CARD RESUMEN QADÁ */}
      <View className="mb-6">
        <Card>
          <View className="mb-3 flex-row items-start justify-between">
            <View>
              <ThemedText
                variant="small"
                className={["font-bold uppercase", mutedTextClass].join(" ")}
              >
                {t.qada.summaryTitle}
              </ThemedText>
              <ThemedText className={["my-1 text-[32px] font-black", balanceValueClass].join(" ")}>
                {balanceText}
              </ThemedText>
              <ThemedText
                variant="small"
                className={["font-medium", mutedTextClass].join(" ")}
              >
                {balanceLabel}
              </ThemedText>
            </View>

            <View className="items-end">
              <ThemedText
                variant="small"
                className={["font-bold uppercase", mutedTextClass].join(" ")}
              >
                {t.qada.summaryDetailsTitle}
              </ThemedText>
              <ThemedText className="mt-1 font-medium">
                {totalMissed} {t.qada.missedLabel}
              </ThemedText>
              <ThemedText className="font-medium">
                {qadaCleared} {t.qada.clearedLabel}
              </ThemedText>
              <ThemedText
                variant="small"
                className={["mt-1 font-medium", mutedTextClass].join(" ")}
              >
                ({netPending} {t.qada.netNegativeLabel.toLowerCase()})
              </ThemedText>
            </View>
          </View>

          {/* INPUT PARA SUMAR QADÁ */}
          <View className="mt-4">
            <Divider className="mb-4" />
            <ThemedText variant="small" className={["mb-3", mutedTextClass].join(" ")}>
              {t.qada.inputLabel}
            </ThemedText>
            <View className="flex-row items-center gap-3">
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="number-pad"
                placeholder={t.qada.inputPlaceholder}
                placeholderTextColor={theme.textMuted}
                className={[
                  "h-12 flex-1 rounded-xl border px-4 text-[18px]",
                  borderColorClass,
                  screenBgClass,
                  textClass,
                ].join(" ")}
              />
              <View className="shrink-0">
                <Button
                  label={t.qada.registerButton}
                  onPress={handleRegisterQada}
                  size="md"
                  variant={isButtonDisabled ? "ghost" : "secondary"}
                  disabled={isButtonDisabled}
                  className="px-6"
                />
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* HISTÓRICO COMPLETO */}
      <View className="mb-3 ml-1">
        <SectionHeader title={t.qada.historyTitle} subtitle={t.qada.historySubtitle} />
      </View>

      {historyKeys.length === 0 ? (
        <ThemedText variant="small" className={["ml-1 mt-1", mutedTextClass].join(" ")}>
          {t.qada.historyEmpty}
        </ThemedText>
      ) : (
        <View className="gap-3">
          {historyKeys.map((dateKey) => {
            const dayStatus: DayStatus =
              tracker[dateKey] ?? createEmptyDayStatus();
            const {
              totalRakats,
              doneRakats,
              completionPercentage,
              donePrayersCount,
            } = computeDayStats(dayStatus);

            return (
              <Pressable
                key={dateKey}
                onPress={() => setEditingDateKey(dateKey)}
                accessibilityRole="button"
                accessibilityLabel={`${t.qada.historySubtitle}. ${formatDateLabel(dateKey, toLocaleTag(locale))}`}
                className="active:opacity-90"
              >
                <Card
                  variant="flat"
                  className="flex-row items-center justify-between px-4 py-4"
                >
                  <View className="flex-1 mr-3">
                    <ThemedText
                      variant="default"
                      className="mb-1.5 font-bold"
                      numberOfLines={1}
                    >
                      {formatDateLabel(dateKey, toLocaleTag(locale))}
                    </ThemedText>

                    <View className="flex-row flex-wrap gap-1.5">
                      <Chip
                        label={`${donePrayersCount}/5 ${t.common.salats}`}
                        variant="muted"
                      />
                      <Chip
                        label={`${doneRakats}/${totalRakats} ${t.prayerInfo.rakats}`}
                        variant="muted"
                      />
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View className="items-end pb-1 min-w-[76px]">
                      <ThemedText
                        variant="default"
                        className={[
                          "font-bold",
                          completionPercentage === 100 ? primaryTextClass : textClass,
                        ].join(" ")}
                      >
                        {completionPercentage}%
                      </ThemedText>
                      <ThemedText
                        variant="small"
                        numberOfLines={1}
                        className={["w-full text-right text-[10px] leading-[14px]", mutedTextClass].join(" ")}
                      >
                        {t.common.progress}
                      </ThemedText>
                    </View>

                    <View className="opacity-60">
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.textMuted}
                      />
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenLayout>
  );
}

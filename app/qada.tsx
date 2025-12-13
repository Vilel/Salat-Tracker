import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
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

import {
  computeDayStats,
  computeTotalMissedRakats,
  createEmptyDayStatus,
  getDateKey,
  getSortedDateKeys,
  loadQadaCleared,
  loadTracker,
  saveQadaCleared,
  type DayStatus,
  type TrackerStore,
} from "@/lib/salat-tracker";

/**
 * Etiqueta amigable de fecha para mostrar en el historial.
 */
function formatDateLabel(dateKey: string, locale: string = "en-US") {
  const date = new Date(dateKey);
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function QadaScreen() {
  const { t } = useLanguage();
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const [tracker, setTracker] = useState<TrackerStore>({});
  const [qadaCleared, setQadaCleared] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

  // Deuda bruta de días pasados
  const totalMissed = useMemo(
    () => computeTotalMissedRakats(tracker, todayKey),
    [tracker, todayKey]
  );

  // Balance global:
  // balance = qadaCleared - totalMissed
  // < 0 → deuda (pendientes) → número NEGATIVO en rojo
  // > 0 → más hechos que pendientes → número POSITIVO en verde
  const balance = qadaCleared - totalMissed;
  const absBalance = Math.abs(balance);

  // 👇 aquí ensanchamos el tipo a string para evitar el error de literales
  let balanceColor: string = theme.text;
  let balanceText = "0";
  let balanceLabel = t.qada.netZeroLabel;

  if (balance < 0) {
    balanceColor = "#dc2626"; // rojo
    balanceText = `-${absBalance}`;
    balanceLabel = t.qada.netNegativeLabel;
  } else if (balance > 0) {
    balanceColor = theme.primary; // verde (primary ya es verde)
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
      {/* HEADER SIN ICONO A LA DERECHA */}
      <View className="mb-6 mt-2">
        <ThemedText variant="title" style={{ letterSpacing: -0.5 }}>
          {t.qada.title}
        </ThemedText>
        <ThemedText variant="default" color={theme.textMuted} className="mt-1">
          {t.qada.subtitle}
        </ThemedText>
      </View>

      {/* CARD RESUMEN QADÁ */}
      <Card className="mb-6">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <ThemedText variant="small" className="font-semibold uppercase opacity-60">
              {t.qada.summaryTitle}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: balanceColor,
                marginVertical: 4,
              }}
            >
              {balanceText}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted}>
              {balanceLabel}
            </ThemedText>
          </View>

          <View className="items-end">
            <ThemedText variant="small" className="uppercase font-semibold opacity-60" color={theme.textMuted}>
              {t.qada.summaryDetailsTitle}
            </ThemedText>
            <ThemedText className="mt-1">
              {totalMissed} {t.qada.missedLabel}
            </ThemedText>
            <ThemedText>
              {qadaCleared} {t.qada.clearedLabel}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted} className="mt-1">
              ({netPending} {t.qada.netNegativeLabel.toLowerCase()})
            </ThemedText>
          </View>
        </View>

        {/* INPUT PARA SUMAR QADÁ */}
        <View className="mt-4">
          <ThemedText variant="small" color={theme.textMuted} className="mb-2">
            {t.qada.inputLabel}
          </ThemedText>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              placeholder={t.qada.inputPlaceholder}
              placeholderTextColor={theme.textMuted}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: theme.text,
                fontSize: FontSizes.sm,
                backgroundColor: theme.background,
              }}
            />
            <Button 
              label={t.qada.registerButton}
              onPress={handleRegisterQada}
              size="sm"
              variant="primary"
              style={{ borderRadius: 999, paddingHorizontal: 20 }}
            />
          </View>
        </View>
      </Card>

      {/* HISTÓRICO COMPLETO */}
      <ThemedText variant="subtitle" className="mb-3 ml-1">
        {t.qada.historyTitle}
      </ThemedText>

      {historyKeys.length === 0 ? (
        <ThemedText variant="small" color={theme.textMuted} className="ml-1 mt-1">
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
              <Card
                key={dateKey}
                variant="flat"
                className="flex-row items-center justify-between py-3 px-4"
                style={{ backgroundColor: theme.card }} // Ensure card bg
              >
                <View>
                  <ThemedText variant="default" className="font-semibold">
                    {formatDateLabel(dateKey, "en-US")}
                  </ThemedText>
                  <ThemedText variant="small" color={theme.textMuted} className="mt-1">
                    {donePrayersCount} / 5 salats | {doneRakats} /{" "}
                    {totalRakats} rak‘ats
                  </ThemedText>
                </View>

                <View className="items-end">
                  <ThemedText variant="default" className="font-bold">
                    {completionPercentage}%
                  </ThemedText>
                  <ThemedText variant="small" color={theme.textMuted}>
                    Completado
                  </ThemedText>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenLayout>
  );
}

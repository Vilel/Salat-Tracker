// app/qada.tsx

import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
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

  const backgroundStyle = { backgroundColor: theme.background };
  const todayKey = getDateKey(new Date());

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
        {/* HEADER SIN ICONO A LA DERECHA */}
        <View className="mb-6 mt-2">
          <Text
            className="font-extrabold"
            style={{
              fontSize: 26,
              color: theme.text,
              letterSpacing: -0.5,
            }}
          >
            {t.qada.title}
          </Text>
          <Text
            style={{
              fontSize: FontSizes.sm,
              color: theme.textMuted,
              marginTop: 4,
            }}
          >
            {t.qada.subtitle}
          </Text>
        </View>

        {/* CARD RESUMEN QADÁ */}
        <View style={cardStyle} className="p-5 mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text
                className="text-xs font-semibold uppercase opacity-60"
                style={{ color: theme.text }}
              >
                {t.qada.summaryTitle}
              </Text>
              <Text
                className="mt-1"
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  color: balanceColor,
                }}
              >
                {balanceText}
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: theme.textMuted }}
              >
                {balanceLabel}
              </Text>
            </View>

            <View className="items-end">
              <Text
                className="text-xs uppercase font-semibold opacity-60"
                style={{ color: theme.textMuted }}
              >
                {t.qada.summaryDetailsTitle}
              </Text>
              <Text
                className="text-sm mt-1"
                style={{ color: theme.text }}
              >
                {totalMissed} {t.qada.missedLabel}
              </Text>
              <Text
                className="text-sm"
                style={{ color: theme.text }}
              >
                {qadaCleared} {t.qada.clearedLabel}
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: theme.textMuted }}
              >
                ({netPending}{" "}
                {t.qada.netNegativeLabel.toLowerCase()})
              </Text>
            </View>
          </View>

          {/* INPUT PARA SUMAR QADÁ */}
          <View className="mt-4">
            <Text
              className="text-xs mb-2"
              style={{ color: theme.textMuted }}
            >
              {t.qada.inputLabel}
            </Text>
            <View className="flex-row items-center">
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
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  color: theme.text,
                  fontSize: FontSizes.sm,
                  marginRight: 8,
                  backgroundColor: theme.background,
                }}
              />
              <TouchableOpacity
                onPress={handleRegisterQada}
                activeOpacity={0.8}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: theme.primary,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: FontSizes.xs,
                  }}
                >
                  {t.qada.registerButton}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* HISTÓRICO COMPLETO */}
        <Text
          className="font-bold mb-3 ml-1"
          style={{ fontSize: FontSizes.lg, color: theme.text }}
        >
          {t.qada.historyTitle}
        </Text>

        {historyKeys.length === 0 ? (
          <Text
            style={{
              fontSize: FontSizes.sm,
              color: theme.textMuted,
              marginLeft: 4,
              marginTop: 4,
            }}
          >
            {t.qada.historyEmpty}
          </Text>
        ) : (
          <View className="space-y-3">
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
                <View
                  key={dateKey}
                  style={cardStyle}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View>
                    <Text
                      className="font-semibold"
                      style={{
                        fontSize: FontSizes.sm,
                        color: theme.text,
                      }}
                    >
                      {formatDateLabel(dateKey, "en-US")}
                    </Text>
                    <Text
                      style={{
                        fontSize: FontSizes.xs,
                        color: theme.textMuted,
                        marginTop: 2,
                      }}
                    >
                      {donePrayersCount} / 5 salats | {doneRakats} /{" "}
                      {totalRakats} rak‘ats
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text
                      style={{
                        fontSize: FontSizes.sm,
                        color: theme.text,
                        fontWeight: "700",
                      }}
                    >
                      {completionPercentage}%
                    </Text>
                    <Text
                      style={{
                        fontSize: FontSizes.xs,
                        color: theme.textMuted,
                      }}
                    >
                      Completado
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

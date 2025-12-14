import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Button, Card, ScreenLayout, ThemedText } from "@/components/ui";
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
  computeTotalMissedRakats,
  createEmptyDayStatus,
  getDateKey,
  getSortedDateKeys,
  loadQadaCleared,
  loadTracker,
  PRAYER_ORDER,
  saveQadaCleared,
  saveTracker,
  togglePrayerForDate,
  type DayStatus,
  type TrackerStore
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
    year: "numeric",
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
  
  // Estado para el modal de edición de día pasado
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

  // Deuda bruta de días pasados
  const totalMissed = useMemo(
    () => computeTotalMissedRakats(tracker, todayKey),
    [tracker, todayKey]
  );

  // Balance global:
  const balance = qadaCleared - totalMissed;
  const absBalance = Math.abs(balance);

  let balanceColor: string = theme.text;
  let balanceText = "0";
  let balanceLabel = t.qada.netZeroLabel;

  if (balance < 0) {
    balanceColor = "#dc2626"; // rojo
    balanceText = `-${absBalance}`;
    balanceLabel = t.qada.netNegativeLabel;
  } else if (balance > 0) {
    balanceColor = theme.primary; // verde
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  // Render del contenido del modal
  const renderEditModal = () => {
    if (!editingDateKey) return null;

    const dayStatus = tracker[editingDateKey] ?? createEmptyDayStatus();
    const dateLabel = formatDateLabel(editingDateKey, "en-US"); // TODO: usar locale real

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!editingDateKey}
        onRequestClose={() => setEditingDateKey(null)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setEditingDateKey(null)}
        >
          <Pressable
            style={{ width: "100%", maxWidth: 340 }}
            onPress={(e) => e.stopPropagation()}
          >
            <Card variant="elevated" style={{ padding: 0, overflow: 'hidden', borderRadius: 24 }}>
              <View style={{ padding: 20, borderBottomWidth: 1, borderColor: theme.border }}>
                <ThemedText variant="subtitle" style={{ textAlign: 'center' }}>
                  {dateLabel}
                </ThemedText>
                <ThemedText
                  variant="small"
                  style={{ textAlign: 'center', marginTop: 4 }}
                  color={theme.textMuted}
                >
                  {t.mySalats.historyTitle}
                </ThemedText>
              </View>

              <View style={{ padding: 8 }}>
                {PRAYER_ORDER.map((name) => {
                  const done = dayStatus[name];
                  const label = t.prayers[name];
                  
                  return (
                    <Pressable
                      key={name}
                      onPress={() => handleToggleHistoryPrayer(editingDateKey, name)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 4,
                        backgroundColor: done ? theme.primary + "15" : "transparent",
                        opacity: pressed ? 0.7 : 1
                      })}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: done ? theme.primary : theme.border,
                          }}
                        >
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={done ? "#fff" : theme.textMuted}
                          />
                        </View>
                        <ThemedText style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                          {label}
                        </ThemedText>
                      </View>
                      
                      {done && (
                        <ThemedText
                          variant="small"
                          style={{ color: theme.primary, fontWeight: "700" }}
                        >
                          {t.mySalats.statusDone}
                        </ThemedText>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ padding: 16, borderTopWidth: 1, borderColor: theme.border }}>
                <Button
                  label={t.common?.close ?? "Close"}
                  onPress={() => setEditingDateKey(null)}
                  variant="outline"
                />
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  return (
    <ScreenLayout contentContainerStyle={{ paddingBottom: 40 }}>
      {renderEditModal()}

      {/* HEADER */}
      <View style={{ marginBottom: 24, marginTop: 8 }}>
        <ThemedText variant="title" style={{ letterSpacing: -0.5 }}>
          {t.qada.title}
        </ThemedText>
        <ThemedText variant="default" color={theme.textMuted} style={{ marginTop: 4 }}>
          {t.qada.subtitle}
        </ThemedText>
      </View>

      {/* CARD RESUMEN QADÁ */}
      <Card style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View>
            <ThemedText variant="small" style={{ fontWeight: '700', textTransform: 'uppercase' }} color={theme.textMuted}>
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
            <ThemedText variant="small" color={theme.textMuted} style={{ fontWeight: "500" }}>
              {balanceLabel}
            </ThemedText>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText variant="small" style={{ textTransform: 'uppercase', fontWeight: '700' }} color={theme.textMuted}>
              {t.qada.summaryDetailsTitle}
            </ThemedText>
            <ThemedText style={{ marginTop: 4, fontWeight: '500' }}>
              {totalMissed} {t.qada.missedLabel}
            </ThemedText>
            <ThemedText style={{ fontWeight: '500' }}>
              {qadaCleared} {t.qada.clearedLabel}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted} style={{ marginTop: 4, fontWeight: "500" }}>
              ({netPending} {t.qada.netNegativeLabel.toLowerCase()})
            </ThemedText>
          </View>
        </View>

        {/* INPUT PARA SUMAR QADÁ */}
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: theme.border }}>
          <ThemedText variant="small" color={theme.textMuted} style={{ marginBottom: 12 }}>
            {t.qada.inputLabel}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              placeholder={t.qada.inputPlaceholder}
              placeholderTextColor={theme.textMuted}
              style={{
                flex: 1,
                height: 48,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                color: theme.text,
                fontSize: FontSizes.base,
                backgroundColor: theme.background,
              }}
            />
            <View style={{ flexShrink: 0 }}>
              <Button 
                label={t.qada.registerButton}
                onPress={handleRegisterQada}
                size="md"
                variant={(!inputValue || parseInt(inputValue) <= 0) ? "ghost" : "secondary"}
                disabled={!inputValue || parseInt(inputValue) <= 0}
                style={{ 
                  height: 48, 
                  paddingHorizontal: 24, 
                  borderRadius: 12,
                  opacity: (!inputValue || parseInt(inputValue) <= 0) ? 0.5 : 1
                }}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* HISTÓRICO COMPLETO */}
      <ThemedText variant="subtitle" style={{ marginBottom: 12, marginLeft: 4 }}>
        {t.qada.historyTitle}
      </ThemedText>

      {historyKeys.length === 0 ? (
        <ThemedText variant="small" color={theme.textMuted} style={{ marginLeft: 4, marginTop: 4 }}>
          {t.qada.historyEmpty}
        </ThemedText>
      ) : (
        <View style={{ gap: 12 }}>
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
              >
                <Card
                  variant="flat"
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.card }}
                >
                  <View className="flex-1 mr-4">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ThemedText 
                        variant="default" 
                        style={{ fontWeight: '600' }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {formatDateLabel(dateKey, "en-US")}
                      </ThemedText>
                      <Ionicons name="pencil" size={12} color={theme.textMuted} style={{ opacity: 0.5 }} />
                    </View>
                    <ThemedText variant="small" color={theme.textMuted} style={{ marginTop: 4 }}>
                      {donePrayersCount} / 5 salats | {doneRakats} /{" "}
                      {totalRakats} rak‘ats
                    </ThemedText>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText variant="default" style={{ fontWeight: '700' }}>
                      {completionPercentage}%
                    </ThemedText>
                    <ThemedText variant="small" color={theme.textMuted}>
                      Completado
                    </ThemedText>
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

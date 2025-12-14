import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, View } from "react-native";

import { Button, Card, ScreenLayout, ThemedText } from "@/components/ui";
import { Colors, type ColorSchemeName } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import {
  usePrayerTheme,
  type PrayerColors,
} from "@/contexts/prayer-theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrayerAlarms } from "@/hooks/usePrayerAlarms";
import type { PrayerName } from "@/lib/prayer-times";

const PRESET_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#f43f5e", // rose-500
];

const PRAYERS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export default function SettingsScreen() {
  const { t } = useLanguage();
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const { colors, updateColor, resetColors } = usePrayerTheme();
  const {
    supported,
    permissionStatus,
    requestPermission,
    preferences,
    toggleAlarm,
    canSchedule,
  } = usePrayerAlarms();

  const [selectedPrayer, setSelectedPrayer] = useState<keyof PrayerColors | null>(
    null
  );

  const handleColorSelect = async (color: string) => {
    if (selectedPrayer) {
      await updateColor(selectedPrayer, color);
      setSelectedPrayer(null);
    }
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 24, marginTop: 8 }}>
          <ThemedText variant="title" style={{ letterSpacing: -0.5 }}>
            {t.settings.title}
          </ThemedText>
          <ThemedText variant="default" color={theme.textMuted} style={{ marginTop: 4 }}>
            {t.settings.prayerColorsSubtitle}
          </ThemedText>
        </View>

        {/* Notifications Settings Card */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ marginBottom: 16 }}>
            <ThemedText variant="subtitle" style={{ marginBottom: 4 }}>
              {t.settings.alarmsTitle}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted}>
              {t.settings.alarmsSubtitle}
            </ThemedText>
          </View>

          {!supported && (
            <View
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                backgroundColor: theme.border + "40",
              }}
            >
              <ThemedText variant="small" color={theme.textMuted}>
                {t.settings.alarmsRequiresDevBuild}
              </ThemedText>
            </View>
          )}

          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <ThemedText variant="small" style={{ fontWeight: '600' }}>
                {t.settings.alarmsPermissionLabel}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>
                {permissionStatus === "granted"
                  ? t.settings.alarmsPermissionGranted
                  : permissionStatus === "denied"
                  ? t.settings.alarmsPermissionDenied
                  : permissionStatus === "undetermined"
                  ? t.settings.alarmsPermissionUndetermined
                  : t.settings.alarmsPermissionUnavailable}
              </ThemedText>
            </View>

            {!canSchedule && supported && (
              <Button
                size="sm"
                variant="secondary"
                label={t.settings.alarmsRequestPermission}
                onPress={() => void requestPermission()}
              />
            )}
          </View>

          <View style={{ gap: 16 }}>
            {PRAYERS.map((prayer) => (
              <View
                key={prayer}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomColor: theme.border,
                  borderBottomWidth: 0.5,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 }}>
                  <Ionicons
                    name={
                      preferences[prayer]
                        ? "notifications"
                        : "notifications-off"
                    }
                    size={24}
                    color={
                      preferences[prayer] ? theme.primary : theme.textMuted
                    }
                  />
                  <ThemedText
                    variant="default"
                    style={{ textTransform: 'capitalize', fontWeight: '500' }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t.prayers[prayer]}
                  </ThemedText>
                </View>

                <Switch
                  value={preferences[prayer]}
                  onValueChange={() => toggleAlarm(prayer)}
                  disabled={!canSchedule}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={"#fff"}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Color Settings Card */}
        <Card>
          <View style={{ marginBottom: 16 }}>
            <ThemedText variant="subtitle" style={{ marginBottom: 4 }}>
              {t.settings.prayerColors}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted}>
              {t.settings.prayerColorsSubtitle}
            </ThemedText>
          </View>

          <View style={{ gap: 16 }}>
            {PRAYERS.map((prayer) => (
              <Pressable
                key={prayer}
                onPress={() =>
                  setSelectedPrayer(prayer as keyof PrayerColors)
                }
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomColor: theme.border,
                  borderBottomWidth: 0.5,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors[prayer as keyof PrayerColors],
                    }}
                  />
                  <ThemedText
                    variant="default"
                    style={{ textTransform: 'capitalize', fontWeight: '500' }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t.prayers[prayer]}
                  </ThemedText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.textMuted}
                />
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 24 }}>
            <Button
              variant="outline"
              label={t.settings.resetColors}
              onPress={resetColors}
              size="sm"
            />
          </View>
        </Card>
      </View>

      {/* Modal Selection Color */}
      <Modal
        visible={!!selectedPrayer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPrayer(null)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
          onPress={() => setSelectedPrayer(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <ThemedText variant="subtitle" style={{ textTransform: 'capitalize' }}>
                {selectedPrayer
                  ? t.prayers[selectedPrayer as PrayerName]
                  : "Select Color"}
              </ThemedText>
              <Pressable onPress={() => setSelectedPrayer(null)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={theme.textMuted}
                />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                {PRESET_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => handleColorSelect(color)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      margin: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: color,
                      borderWidth:
                        colors[selectedPrayer as keyof PrayerColors] ===
                        color
                          ? 3
                          : 0,
                      borderColor: theme.text,
                    }}
                  >
                    {colors[selectedPrayer as keyof PrayerColors] ===
                      color && (
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button, Card, Divider, ScreenHeader, ScreenLayout, ThemedText, ToggleRow } from "@/components/ui";
import { Colors, type ColorSchemeName } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import {
  usePrayerTheme,
  type PrayerColors,
} from "@/contexts/prayer-theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsRTL } from "@/hooks/use-is-rtl";
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
  const isRTL = useIsRTL();
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  const mutedSurfaceClass = isDark
    ? "bg-app-border-dark/60"
    : "bg-app-border-light/60";
  const pressedRowClass = isDark
    ? "active:bg-app-border-dark/40"
    : "active:bg-app-border-light/40";
  const sheetBgClass = isDark ? "bg-app-card-dark" : "bg-app-card-light";

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
    <ScreenLayout contentContainerClassName="pb-10">
      <ScreenHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      {/* Notifications Settings Card */}
      <View className="mb-6">
        <Card>
          <View className="mb-4">
            <ThemedText variant="subtitle" className="mb-1">
              {t.settings.alarmsTitle}
            </ThemedText>
            <ThemedText variant="small" className={mutedTextClass}>
              {t.settings.alarmsSubtitle}
            </ThemedText>
          </View>

          {!supported ? (
            <View className={["mb-4 rounded-xl p-3", mutedSurfaceClass].join(" ")}>
              <ThemedText variant="small" className={mutedTextClass}>
                {t.settings.alarmsRequiresDevBuild}
              </ThemedText>
            </View>
          ) : null}

          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <ThemedText variant="small" className="font-semibold">
                {t.settings.alarmsPermissionLabel}
              </ThemedText>
              <ThemedText variant="small" className={mutedTextClass}>
                {permissionStatus === "granted"
                  ? t.settings.alarmsPermissionGranted
                  : permissionStatus === "denied"
                  ? t.settings.alarmsPermissionDenied
                  : permissionStatus === "undetermined"
                  ? t.settings.alarmsPermissionUndetermined
                  : t.settings.alarmsPermissionUnavailable}
              </ThemedText>
            </View>

            {!canSchedule && supported ? (
              <Button
                size="sm"
                variant="secondary"
                label={t.settings.alarmsRequestPermission}
                onPress={() => void requestPermission()}
              />
            ) : null}
          </View>

          <View>
            {PRAYERS.map((prayer, index) => (
              <View key={prayer}>
                <ToggleRow
                  left={
                    <Ionicons
                      name={preferences[prayer] ? "notifications" : "notifications-off"}
                      size={24}
                      color={preferences[prayer] ? theme.primary : theme.textMuted}
                    />
                  }
                  title={t.prayers[prayer]}
                  description={t.settings.alarmsSubtitle}
                  value={preferences[prayer]}
                  onValueChange={() => toggleAlarm(prayer)}
                  disabled={!canSchedule}
                />

                {index < PRAYERS.length - 1 ? (
                  <Divider insetClassName={isRTL ? "mr-9" : "ml-9"} />
                ) : null}
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Color Settings Card */}
      <Card>
        <View className="mb-4">
          <ThemedText variant="subtitle" className="mb-1">
            {t.settings.prayerColors}
          </ThemedText>
          <ThemedText variant="small" className={mutedTextClass}>
            {t.settings.prayerColorsSubtitle}
          </ThemedText>
        </View>

        <View>
          {PRAYERS.map((prayer, index) => (
            <View key={prayer}>
              <Pressable
                onPress={() => setSelectedPrayer(prayer as keyof PrayerColors)}
                accessibilityRole="button"
                accessibilityLabel={t.prayers[prayer]}
                className={[
                  "items-center py-3.5",
                  isRTL ? "flex-row-reverse" : "flex-row",
                  pressedRowClass,
                ].join(" ")}
              >
                <View
                  className={[isRTL ? "ml-4" : "mr-4", "h-8 w-8 rounded-full"].join(" ")}
                  style={{ backgroundColor: colors[prayer as keyof PrayerColors] }}
                />

                <ThemedText
                  className="flex-1 text-[16px] font-semibold"
                  align={isRTL ? "right" : "left"}
                >
                  {t.prayers[prayer]}
                </ThemedText>

                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={20}
                  color={theme.textMuted}
                />
              </Pressable>

              {index < PRAYERS.length - 1 ? (
                <Divider insetClassName={isRTL ? "mr-12" : "ml-12"} />
              ) : null}
            </View>
          ))}
        </View>

        <View className="mt-6">
          <Button
            variant="outline"
            label={t.settings.resetColors}
            onPress={resetColors}
            size="sm"
          />
        </View>
      </Card>

      {/* Modal Selection Color */}
      <Modal
        visible={!!selectedPrayer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPrayer(null)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setSelectedPrayer(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={["rounded-t-3xl p-6 pb-10", sheetBgClass].join(" ")}
          >
            <View
              className={[
                "mb-6 items-center justify-between",
                isRTL ? "flex-row-reverse" : "flex-row",
              ].join(" ")}
            >
              <ThemedText variant="subtitle" className="capitalize" align={isRTL ? "right" : "left"}>
                {selectedPrayer ? t.prayers[selectedPrayer as PrayerName] : ""}
              </ThemedText>
              <Pressable
                onPress={() => setSelectedPrayer(null)}
                accessibilityRole="button"
                accessibilityLabel={t.common.close}
                hitSlop={10}
                className="-m-1 p-1 active:opacity-70"
              >
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
              className="mb-4"
            >
              <View className="flex-row flex-wrap justify-center gap-4">
                {PRESET_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => handleColorSelect(color)}
                    className={[
                      "m-1 h-12 w-12 items-center justify-center rounded-full",
                      colors[selectedPrayer as keyof PrayerColors] === color
                        ? `border-[3px] ${isDark ? "border-app-text-dark" : "border-app-text-light"}`
                        : "border-0",
                    ].join(" ")}
                    style={{ backgroundColor: color }}
                  >
                    {colors[selectedPrayer as keyof PrayerColors] === color ? (
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    ) : null}
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

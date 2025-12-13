import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { ThemedText } from "@/components/ui/ThemedText";
import { Colors, type ColorSchemeName } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { usePrayerTheme, type PrayerColors } from "@/contexts/prayer-theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

  const [selectedPrayer, setSelectedPrayer] = useState<keyof PrayerColors | null>(null);

  const handleColorSelect = async (color: string) => {
    if (selectedPrayer) {
      await updateColor(selectedPrayer, color);
      setSelectedPrayer(null);
    }
  };

  return (
    <ScreenLayout>
      <View className="flex-1 pb-10">
        {/* Header */}
        <View className="mb-6 mt-2">
          <ThemedText variant="title" style={{ letterSpacing: -0.5 }}>
            {t.settings.title}
          </ThemedText>
          <ThemedText variant="default" color={theme.textMuted} className="mt-1">
            {t.settings.prayerColorsSubtitle}
          </ThemedText>
        </View>

        {/* Color Settings Card */}
        <Card>
          <View className="mb-4">
            <ThemedText variant="subtitle" className="mb-1">
              {t.settings.prayerColors}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted}>
              {t.settings.prayerColorsSubtitle}
            </ThemedText>
          </View>

          <View className="gap-4">
            {PRAYERS.map((prayer) => (
              <Pressable
                key={prayer}
                onPress={() => setSelectedPrayer(prayer as keyof PrayerColors)}
                className="flex-row items-center justify-between py-2 border-b"
                style={{ borderBottomColor: theme.border, borderBottomWidth: 0.5 }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-8 h-8 rounded-full shadow-sm"
                    style={{ backgroundColor: colors[prayer as keyof PrayerColors] }}
                  />
                  <ThemedText variant="default" className="capitalize font-medium">
                    {t.prayers[prayer]}
                  </ThemedText>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </Pressable>
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
      </View>

      {/* Modal Selection Color */}
      <Modal
        visible={!!selectedPrayer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPrayer(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setSelectedPrayer(null)}
        >
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            style={{ 
                backgroundColor: theme.card, 
                borderTopLeftRadius: 32, 
                borderTopRightRadius: 32,
                padding: 24,
                paddingBottom: 40
            }}
          >
            <View className="flex-row justify-between items-center mb-6">
                <ThemedText variant="subtitle" className="capitalize">
                    {selectedPrayer ? t.prayers[selectedPrayer as PrayerName] : "Select Color"}
                </ThemedText>
                <Pressable onPress={() => setSelectedPrayer(null)}>
                    <Ionicons name="close-circle" size={28} color={theme.textMuted} />
                </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row flex-wrap gap-4 justify-center">
                    {PRESET_COLORS.map(color => (
                        <Pressable
                            key={color}
                            onPress={() => handleColorSelect(color)}
                            className="w-12 h-12 rounded-full m-1 shadow-sm items-center justify-center"
                            style={{ 
                                backgroundColor: color,
                                borderWidth: colors[selectedPrayer as keyof PrayerColors] === color ? 3 : 0,
                                borderColor: theme.text
                            }}
                        >
                             {colors[selectedPrayer as keyof PrayerColors] === color && (
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


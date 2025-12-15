import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { AnalogClock } from "@/components/AnalogClock";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LocationSelector } from "@/components/LocationSelector";
import { NextPrayerDisplay } from "@/components/NextPrayerDisplay";
import { PrayerTimeline } from "@/components/PrayerTimeline";
import { Button, ScreenHeader, ScreenLayout, ThemedText } from "@/components/ui";
import { Colors, type ColorSchemeName } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

export default function HomeScreen() {
  const { t } = useLanguage();

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const {
    loadingState,
    errorKind,
    prayers,
    nextPrayer,
    location,
    locationMode,
    setLocationMode,
    retry,
  } = usePrayerTimes();

  const errorMessage = useMemo(() => {
    if (errorKind === "fetch_failed") {
      return t.errors?.fetchFailed || "Failed to load prayer times";
    }
    return "";
  }, [errorKind, t.errors?.fetchFailed]);

  // --- estados de carga / error ---

  if (loadingState === "loading") {
    return (
      <ScreenLayout scrollable={false}>
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            variant="subtitle"
            className={`${colorScheme === "dark" ? "text-app-textMuted-dark" : "text-app-textMuted-light"} mt-4 text-center`}
          >
            {t.loading}
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (loadingState === "error") {
    return (
      <ScreenLayout scrollable={false}>
        <View className="flex-1 items-center justify-center px-8">
          <ThemedText className="mb-3 text-[56px]">⚠️</ThemedText>
          <ThemedText
            variant="subtitle"
            className="mb-6 text-center"
          >
            {errorMessage}
          </ThemedText>
          
          <Button 
            label={t.retry}
            onPress={retry}
            variant="primary"
            size="lg"
            className="min-w-[160px]"
          />
        </View>
      </ScreenLayout>
    );
  }

  if (!prayers || !nextPrayer) {
    return null;
  }

  // --- render normal ---

  return (
    <ScreenLayout>
      <View className="flex-1 gap-6 pb-6">
        {/* Header: selector de ubicación + selector de idioma */}
        <View className="flex-row items-center justify-between gap-2">
          <LocationSelector
            mode={locationMode}
            city={location?.city}
            country={location?.country}
            onChangeMode={setLocationMode}
          />
          <LanguageSelector />
        </View>

        {/* Próximo rezo */}
        <NextPrayerDisplay prayer={nextPrayer} />

        {/* Reloj analógico */}
        <AnalogClock
          prayers={prayers}
          nextPrayer={nextPrayer.name}
        />

        {/* Timeline */}
        <PrayerTimeline
          prayers={prayers}
          nextPrayer={nextPrayer.name}
        />
      </View>
    </ScreenLayout>
  );
}

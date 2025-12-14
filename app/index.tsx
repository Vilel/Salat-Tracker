import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { AnalogClock } from "@/components/AnalogClock";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LocationSelector } from "@/components/LocationSelector";
import { NextPrayerDisplay } from "@/components/NextPrayerDisplay";
import { PrayerTimeline } from "@/components/PrayerTimeline";
import { Button, ScreenLayout, ThemedText } from "@/components/ui";
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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            variant="subtitle"
            color={theme.textMuted}
            style={{ marginTop: 16, textAlign: "center", fontSize: 18 }}
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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <ThemedText style={{ fontSize: 56, marginBottom: 12 }}>⚠️</ThemedText>
          <ThemedText
            variant="subtitle"
            color={theme.text}
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            {errorMessage}
          </ThemedText>
          
          <Button 
            label={t.retry}
            onPress={retry}
            variant="primary"
            size="lg"
            style={{ minWidth: 160 }}
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
      <View style={{ flex: 1, gap: 24, paddingBottom: 24 }}>
        {/* Header: selector de ubicación + selector de idioma */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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

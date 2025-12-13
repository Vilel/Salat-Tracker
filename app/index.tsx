import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";

import { AnalogClock } from "@/components/AnalogClock";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  LocationSelector,
  type LocationMode,
} from "@/components/LocationSelector";
import { NextPrayerDisplay } from "@/components/NextPrayerDisplay";
import { PrayerTimeline } from "@/components/PrayerTimeline";
import { Button } from "@/components/ui/Button";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  Colors,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  fetchPrayerTimesFromAPI,
  getDefaultLocation,
  getNextPrayer,
  type DayPrayers,
  type LocationData,
  type PrayerTime,
} from "@/lib/prayer-times";

type LoadingState = "loading" | "success" | "error";

export default function HomeScreen() {
  const { t } = useLanguage();

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const [prayers, setPrayers] = useState<DayPrayers | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [locationMode, setLocationMode] = useState<LocationMode>("auto");

  const loadPrayerTimes = useCallback(
    async (loc: LocationData) => {
      try {
        const todayPrayers = await fetchPrayerTimesFromAPI(
          loc.latitude,
          loc.longitude
        );
        setPrayers(todayPrayers);
        setNextPrayer(getNextPrayer(todayPrayers));
        setLoadingState("success");
      } catch (error) {
        console.error("Failed to fetch prayer times:", error);
        setErrorMessage(
          t.errors?.fetchFailed || "Failed to load prayer times"
        );
        setLoadingState("error");
      }
    },
    [t]
  );

  const handleLocationModeChange = useCallback(
    async (mode: LocationMode) => {
      setLoadingState("loading");

      let loc: LocationData;

      if (mode === "auto") {
        try {
          const { status } =
            await Location.requestForegroundPermissionsAsync();

          if (status === "granted") {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            try {
              const [geocode] = await Location.reverseGeocodeAsync({
                latitude: loc.latitude,
                longitude: loc.longitude,
              });
              if (geocode) {
                loc.city =
                  geocode.city || geocode.subregion || undefined;
                loc.country = geocode.country || undefined;
              }
            } catch (geoError) {
              console.warn("Reverse geocoding failed:", geoError);
            }
          } else {
            loc = getDefaultLocation();
          }
        } catch (error) {
          console.warn(
            "Geolocation failed, using default location:",
            error
          );
          loc = getDefaultLocation();
        }
      } else {
        // modo "default"
        loc = getDefaultLocation();
      }

      setLocation(loc);
      await loadPrayerTimes(loc);
    },
    [loadPrayerTimes]
  );

  // Ejecutar al inicio y cada vez que cambie el modo de ubicación
  useEffect(() => {
    handleLocationModeChange(locationMode);
  }, [locationMode, handleLocationModeChange]);

  // Actualizar siguiente oración cada minuto
  useEffect(() => {
    if (!prayers) return;

    const interval = setInterval(() => {
      setNextPrayer(getNextPrayer(prayers));
    }, 60000);

    return () => clearInterval(interval);
  }, [prayers]);

  const handleRetry = () => {
    handleLocationModeChange(locationMode);
  };

  // --- estados de carga / error ---

  if (loadingState === "loading") {
    return (
      <ScreenLayout scrollable={false}>
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            variant="subtitle"
            className="mt-4 text-center"
            color={theme.textMuted}
            style={{ fontSize: 18 }}
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
          <ThemedText style={{ fontSize: 56, marginBottom: 12 }}>⚠️</ThemedText>
          <ThemedText
            variant="subtitle"
            className="text-center mb-6"
            color={theme.text}
          >
            {errorMessage}
          </ThemedText>
          
          <Button 
            label={t.retry}
            onPress={handleRetry}
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

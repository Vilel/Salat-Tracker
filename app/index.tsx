// app/index.tsx

import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnalogClock } from "@/components/AnalogClock";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  LocationSelector,
  type LocationMode,
} from "@/components/LocationSelector";
import { NextPrayerDisplay } from "@/components/NextPrayerDisplay";
import { PrayerTimeline } from "@/components/PrayerTimeline";
import {
  Colors,
  FontSizes,
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

  const backgroundStyle = { backgroundColor: theme.background };

  // --- estados de carga / error ---

  if (loadingState === "loading") {
    return (
      <SafeAreaView
        className="flex-1"
        style={backgroundStyle}
      >
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            className="mt-4 text-center"
            style={{ fontSize: FontSizes.lg, color: theme.textMuted }}
          >
            {t.loading}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingState === "error") {
    return (
      <SafeAreaView
        className="flex-1"
        style={backgroundStyle}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 56, marginBottom: 12 }}>⚠️</Text>
          <Text
            className="text-center mb-4"
            style={{ fontSize: FontSizes.lg, color: theme.text }}
          >
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="flex-row items-center rounded-2xl px-6 py-3"
            style={{ backgroundColor: theme.primary }}
          >
            <Text
              style={{
                fontSize: FontSizes.base,
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              {t.retry}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!prayers || !nextPrayer) {
    return null;
  }

  // --- render normal ---

  return (
    <SafeAreaView
      className="flex-1"
      style={backgroundStyle}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 py-4">
          {/* Esta columna ocupa todo el alto y reparte el espacio
              de forma uniforme entre los 4 bloques */}
          <View className="flex-1 justify-between">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

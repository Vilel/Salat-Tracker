// app/index.tsx

import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  fetchPrayerTimesFromAPI,
  getDefaultLocation,
  getNextPrayer,
  type DayPrayers,
  type LocationData,
  type PrayerTime,
} from "@/lib/prayer-times";

import { AnalogClock } from "@/components/AnalogClock";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  LocationSelector,
  type LocationMode,
} from "@/components/LocationSelector";
import { NextPrayerDisplay } from "@/components/NextPrayerDisplay";
import { PrayerTimeline } from "@/components/PrayerTimeline";
import { Colors, FontSizes } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type LoadingState = "loading" | "success" | "error";

export default function HomeScreen() {
  const { t } = useLanguage();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [prayers, setPrayers] = useState<DayPrayers | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [locationMode, setLocationMode] = useState<LocationMode>("auto");

  const styles = makeStyles(theme);

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
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingState === "error") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>{t.retry}</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: selector de ubicación + selector de idioma */}
        <View style={styles.header}>
          <LocationSelector
            mode={locationMode}
            city={location?.city}
            country={location?.country}
            onChangeMode={setLocationMode}
          />
          <LanguageSelector />
        </View>

        {/* Contenido principal */}
        <View style={styles.mainContent}>
          <NextPrayerDisplay prayer={nextPrayer} />
          <AnalogClock
            prayers={prayers}
            nextPrayer={nextPrayer.name}
          />
        </View>

        {/* Timeline de oraciones */}
        <View style={styles.timelineContainer}>
          <PrayerTimeline
            prayers={prayers}
            nextPrayer={nextPrayer.name}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: (typeof Colors)["light"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      padding: 32,
    },
    loadingText: {
      fontSize: FontSizes.lg,
      color: theme.textMuted,
      marginTop: 16,
    },
    errorIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    errorText: {
      fontSize: FontSizes.lg,
      color: theme.text,
      textAlign: "center",
    },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 16,
      paddingHorizontal: 32,
      backgroundColor: theme.primary,
      borderRadius: 16,
      marginTop: 16,
    },
    retryButtonText: {
      fontSize: FontSizes.base,
      fontWeight: "600",
      color: "#ffffff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 8,
    },
    mainContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 32,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    timelineContainer: {
      paddingVertical: 16,
      paddingHorizontal: 8,
    },
  });
}

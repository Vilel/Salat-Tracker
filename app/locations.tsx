// app/locations.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
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
import { getDefaultLocation } from "@/lib/prayer-times";

const SAVED_LOCATIONS_KEY = "@salat_saved_locations_v1";

interface SavedLocation {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export default function LocationsScreen() {
  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const { t } = useLanguage();

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SavedLocation[];
          setSavedLocations(parsed);
        }
      } catch (err) {
        console.warn("Failed to load saved locations:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const persistLocations = async (list: SavedLocation[]) => {
    setSavedLocations(list);
    try {
      await AsyncStorage.setItem(
        SAVED_LOCATIONS_KEY,
        JSON.stringify(list)
      );
    } catch (err) {
      console.warn("Failed to persist saved locations:", err);
    }
  };

  const handleSaveCurrentLocation = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location permission",
          "Permission to access location was denied."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      let city: string | undefined;
      let country: string | undefined;

      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode) {
          city = geocode.city || geocode.subregion || undefined;
          country = geocode.country || undefined;
        }
      } catch (geoError) {
        console.warn("Reverse geocoding failed:", geoError);
      }

      const label =
        city ||
        country ||
        `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;

      const newLoc: SavedLocation = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        label,
        latitude,
        longitude,
        city,
        country,
      };

      // Evitar duplicados aproximados por coordenadas
      const exists = savedLocations.some(
        (l) =>
          Math.abs(l.latitude - newLoc.latitude) < 0.0001 &&
          Math.abs(l.longitude - newLoc.longitude) < 0.0001
      );
      if (exists) {
        Alert.alert(
          "Already saved",
          "This location is already in your list."
        );
        return;
      }

      await persistLocations([newLoc, ...savedLocations]);
    } catch (err) {
      console.warn("Failed to save current location:", err);
      Alert.alert(
        "Error",
        "Could not save your current location. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const updated = savedLocations.filter((l) => l.id !== id);
    await persistLocations(updated);
  };

  const defaultLoc = getDefaultLocation();
  const defaultLabel =
    [defaultLoc.city, defaultLoc.country].filter(Boolean).join(", ") ||
    "Makkah, Saudi Arabia";

  const backgroundStyle = { backgroundColor: theme.background };

  return (
    <SafeAreaView
      className="flex-1"
      style={backgroundStyle}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Text
          className="mb-1"
          style={{
            fontSize: FontSizes.lg,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          Locations
        </Text>
        <Text
          className="mb-4"
          style={{
            fontSize: FontSizes.sm,
            color: theme.textMuted,
          }}
        >
          Manage your saved locations for prayer times.
        </Text>

        {/* Botón: guardar ubicación actual */}
        <TouchableOpacity
          onPress={handleSaveCurrentLocation}
          disabled={saving}
          className="flex-row items-center justify-center rounded-2xl mb-4"
          style={{
            backgroundColor: theme.primary,
            opacity: saving ? 0.7 : 1,
            paddingVertical: 10,
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: FontSizes.sm,
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            {saving ? "Saving..." : "Save current location"}
          </Text>
        </TouchableOpacity>

        {/* Sección: ubicaciones especiales (no borrables) */}
        <View
          className="rounded-3xl border px-4 py-3 mb-4"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              fontSize: FontSizes.sm,
              fontWeight: "600",
              color: theme.text,
            }}
          >
            Current & default
          </Text>

          <View className="mt-3 gap-2">
            {/* Current location */}
            <View className="flex-row items-center justify-between py-1.5">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: theme.primary + "22" }}
                >
                  <Ionicons
                    name="navigate"
                    size={18}
                    color={theme.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: FontSizes.sm,
                      fontWeight: "600",
                      color: theme.text,
                    }}
                  >
                    {t.location.using ?? "Current location"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.textMuted,
                      marginTop: 2,
                    }}
                  >
                    Use GPS to detect your city
                  </Text>
                </View>
              </View>
            </View>

            {/* Default location */}
            <View className="flex-row items-center justify-between py-1.5">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: theme.primary + "22" }}
                >
                  <Ionicons
                    name="location"
                    size={18}
                    color={theme.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: FontSizes.sm,
                      fontWeight: "600",
                      color: theme.text,
                    }}
                  >
                    {t.location.default ?? "Default location"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.textMuted,
                      marginTop: 2,
                    }}
                  >
                    {defaultLabel}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: ubicaciones guardadas */}
        <View
          className="rounded-3xl border px-4 py-3"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              fontSize: FontSizes.sm,
              fontWeight: "600",
              color: theme.text,
            }}
          >
            Saved locations
          </Text>

          {loading ? (
            <View className="mt-3">
              <Text
                style={{
                  fontSize: FontSizes.sm,
                  color: theme.textMuted,
                }}
              >
                Loading saved locations…
              </Text>
            </View>
          ) : savedLocations.length === 0 ? (
            <View className="mt-3">
              <Text
                style={{
                  fontSize: FontSizes.sm,
                  color: theme.textMuted,
                }}
              >
                You have no saved locations yet.
              </Text>
            </View>
          ) : (
            <View className="mt-3">
              {savedLocations.map((loc) => {
                const subLabel =
                  [loc.city, loc.country].filter(Boolean).join(", ") ||
                  `Lat ${loc.latitude.toFixed(
                    2
                  )}, Lon ${loc.longitude.toFixed(2)}`;

                return (
                  <View
                    key={loc.id}
                    className="flex-row items-center justify-between py-1.5"
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: theme.primary + "22",
                        }}
                      >
                        <Ionicons
                          name="bookmark"
                          size={18}
                          color={theme.primary}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{
                            fontSize: FontSizes.sm,
                            fontWeight: "600",
                            color: theme.text,
                          }}
                          numberOfLines={1}
                        >
                          {loc.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: theme.textMuted,
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {subLabel}
                        </Text>
                      </View>
                    </View>

                    {/* Botón borrar (solo para saved, no afecta current/default) */}
                    <TouchableOpacity
                      onPress={() => handleDeleteLocation(loc.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

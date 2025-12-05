// components/LocationSelector.tsx

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  Colors,
  FontSizes,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type LocationMode = "auto" | "default";

interface LocationSelectorProps {
  mode: LocationMode;
  city?: string;
  country?: string;
  onChangeMode: (mode: LocationMode) => void;
}

export function LocationSelector({
  mode,
  city,
  country,
  onChangeMode,
}: LocationSelectorProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  // Texto corto para el botón (similar a ES/EN del selector de idioma)
  const shortLabel =
    city ??
    (mode === "default"
      ? "Makkah"
      : t.location.using ?? "GPS");

  const handleSelect = (newMode: LocationMode) => {
    setOpen(false);
    if (newMode !== mode) {
      onChangeMode(newMode);
    }
  };

  const stopPressPropagation = (e: GestureResponderEvent) => {
    e.stopPropagation();
  };

  const iconName = mode === "auto" ? "navigate" : "location";

  return (
    <View>
      {/* --- BOTÓN PRINCIPAL (mismo patrón que LanguageSelector) --- */}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center rounded-full border px-4 py-2"
        style={({ pressed }) => ({
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={theme.primary}
          style={{ marginRight: 8 }}
        />

        <Text
          className="font-semibold mr-2"
          numberOfLines={1}
          style={{
            fontSize: FontSizes.sm,
            color: theme.text,
          }}
        >
          {shortLabel}
        </Text>

        <Ionicons
          name="chevron-down"
          size={14}
          color={theme.textMuted}
          style={{ marginTop: 1 }}
        />
      </Pressable>

      {/* --- MODAL DE SELECCIÓN --- */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop: cierra al pulsar fuera */}
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setOpen(false)}
        >
          {/* Tarjeta central (evita cerrar al tocar dentro) */}
          <Pressable
            onPress={stopPressPropagation}
            className="w-[320px] rounded-3xl overflow-hidden shadow-xl"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {/* Header */}
            <View
              className="px-5 py-4 border-b"
              style={{ borderBottomColor: theme.border }}
            >
              <Text
                className="font-bold text-center"
                style={{ color: theme.text, fontSize: FontSizes.base }}
              >
                {t.location.using ?? "Location"}
              </Text>
              <Text
                className="text-center mt-1"
                style={{
                  color: theme.textMuted,
                  fontSize: FontSizes.xs,
                }}
              >
                Choose how to detect your prayer location
              </Text>
            </View>

            {/* Opciones */}
            <View className="py-2">
              {/* Ubicación automática (GPS) */}
              <Pressable
                onPress={() => handleSelect("auto")}
                className="flex-row items-center px-5 py-3 mx-2 rounded-2xl mb-1"
                style={({ pressed }) => ({
                  backgroundColor:
                    mode === "auto"
                      ? theme.primary + "15"
                      : pressed
                      ? theme.background
                      : "transparent",
                })}
              >
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
                    className="font-semibold"
                    style={{
                      fontSize: FontSizes.sm,
                      color: mode === "auto" ? theme.primary : theme.text,
                    }}
                  >
                    {t.location.using ?? "Current location"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: FontSizes.xs,
                      color: theme.textMuted,
                    }}
                  >
                    Use GPS to detect your city
                  </Text>
                </View>

                {mode === "auto" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.primary}
                  />
                )}
              </Pressable>

              {/* Ubicación predeterminada (Makkah) */}
              <Pressable
                onPress={() => handleSelect("default")}
                className="flex-row items-center px-5 py-3 mx-2 rounded-2xl mb-1"
                style={({ pressed }) => ({
                  backgroundColor:
                    mode === "default"
                      ? theme.primary + "15"
                      : pressed
                      ? theme.background
                      : "transparent",
                })}
              >
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
                    className="font-semibold"
                    style={{
                      fontSize: FontSizes.sm,
                      color:
                        mode === "default" ? theme.primary : theme.text,
                    }}
                  >
                    {t.location.default ?? "Default location"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: FontSizes.xs,
                      color: theme.textMuted,
                    }}
                  >
                    Makkah, Saudi Arabia
                  </Text>
                </View>

                {mode === "default" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.primary}
                  />
                )}
              </Pressable>

              {/* Aquí, más adelante, añadiremos:
                 - Lista de “Saved locations”
                 - Botón “Manage locations” que abrirá la pantalla del bottom nav */}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

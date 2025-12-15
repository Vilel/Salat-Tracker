import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    GestureResponderEvent,
    Modal,
    Pressable,
    View,
} from "react-native";

import { Card, ThemedText } from "@/components/ui";
import {
    Colors,
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
  const isDark = colorScheme === "dark";

  const containerBgClass = isDark ? "bg-app-card-dark" : "bg-app-card-light";
  const borderClass = isDark ? "border-app-border-dark" : "border-app-border-light";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  const textClass = isDark ? "text-app-text-dark" : "text-app-text-light";
  const primaryTextClass = isDark ? "text-app-primary-dark" : "text-app-primary-light";
  const pressedRowClass = isDark
    ? "active:bg-app-border-dark/40"
    : "active:bg-app-border-light/40";
  const selectedRowClass = isDark ? "bg-app-primary-dark/10" : "bg-app-primary-light/10";

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
        className={[
          "flex-row items-center rounded-full border px-4 py-2 active:opacity-70 active:scale-95",
          containerBgClass,
          borderClass,
        ].join(" ")}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={theme.primary}
        />
        <View className="w-2" />

        <ThemedText
          variant="small"
          className="mr-2 flex-shrink font-semibold"
          numberOfLines={1}
        >
          {shortLabel}
        </ThemedText>

        <View className="mt-[1px]">
          <Ionicons
            name="chevron-down"
            size={14}
            color={theme.textMuted}
          />
        </View>
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
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setOpen(false)}
        >
          {/* Tarjeta central (evita cerrar al tocar dentro) */}
          <Pressable onPress={stopPressPropagation}>
            <Card
              variant="elevated"
              className="w-[320px] rounded-3xl overflow-hidden p-0"
            >
              {/* Header */}
              <View
                className={["px-5 py-4 border-b", borderClass].join(" ")}
              >
                <ThemedText variant="default" className="font-bold text-center">
                  {t.location.using ?? "Location"}
                </ThemedText>
                <ThemedText
                  variant="small"
                  className={["text-center mt-1", mutedTextClass].join(" ")}
                >
                  Choose how to detect your prayer location
                </ThemedText>
              </View>

              {/* Opciones */}
              <View className="py-2">
                {/* Ubicación automática (GPS) */}
                <Pressable
                  onPress={() => handleSelect("auto")}
                  className={[
                    "mx-2 mb-1 flex-row items-center rounded-2xl px-5 py-3",
                    mode === "auto" ? selectedRowClass : pressedRowClass,
                  ].join(" ")}
                >
                  <View
                    className={[
                      "h-9 w-9 items-center justify-center rounded-full mr-3",
                      isDark ? "bg-app-primary-dark/15" : "bg-app-primary-light/10",
                    ].join(" ")}
                  >
                    <Ionicons
                      name="navigate"
                      size={18}
                      color={theme.primary}
                    />
                  </View>

                  <View className="flex-1">
                    <ThemedText
                      variant="small"
                      className={[
                        "font-semibold",
                        mode === "auto" ? primaryTextClass : textClass,
                      ].join(" ")}
                    >
                      {t.location.using ?? "Current location"}
                    </ThemedText>
                    <ThemedText
                      variant="small"
                      className={["mt-0.5 text-[11px]", mutedTextClass].join(" ")}
                    >
                      Use GPS to detect your city
                    </ThemedText>
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
                  className={[
                    "mx-2 mb-1 flex-row items-center rounded-2xl px-5 py-3",
                    mode === "default" ? selectedRowClass : pressedRowClass,
                  ].join(" ")}
                >
                  <View
                    className={[
                      "h-9 w-9 items-center justify-center rounded-full mr-3",
                      isDark ? "bg-app-primary-dark/15" : "bg-app-primary-light/10",
                    ].join(" ")}
                  >
                    <Ionicons
                      name="location"
                      size={18}
                      color={theme.primary}
                    />
                  </View>

                  <View className="flex-1">
                    <ThemedText
                      variant="small"
                      className={[
                        "font-semibold",
                        mode === "default" ? primaryTextClass : textClass,
                      ].join(" ")}
                    >
                      {t.location.default ?? "Default location"}
                    </ThemedText>
                    <ThemedText
                      variant="small"
                      className={["mt-0.5 text-[11px]", mutedTextClass].join(" ")}
                    >
                      Makkah, Saudi Arabia
                    </ThemedText>
                  </View>

                  {mode === "default" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.primary}
                    />
                  )}
                </Pressable>
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// components/LocationSelector.tsx

import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

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

  const locationLabel =
    city || country
      ? [city, country].filter(Boolean).join(", ")
      : mode === "default"
        ? "Makkah, Saudi Arabia"
        : t.location?.using ?? "Current location";

  const modeLabel =
    mode === "auto"
      ? t.location?.using ?? "Current location"
      : t.location?.default ?? "Default location";

  const handleSelect = (newMode: LocationMode) => {
    setOpen(false);
    if (newMode !== mode) {
      onChangeMode(newMode);
    }
  };

  return (
    <View className="relative">
      {/* Botón principal */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="min-w-[180px] max-w-[230px] bg-white/90 border border-slate-200 rounded-3xl px-3 py-2 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-1 mr-2">
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            {locationLabel}
          </Text>
          <Text className="text-[13px] font-semibold text-slate-800" numberOfLines={1}>
            {modeLabel}
          </Text>
        </View>
        <Text className="text-slate-400 text-lg">▾</Text>
      </Pressable>

      {/* Dropdown */}
      {open && (
        <View className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-10">
          <Pressable
            onPress={() => handleSelect("auto")}
            className="px-3 py-2.5"
          >
            <Text className="text-sm font-semibold text-slate-800">
              {t.location?.using ?? "Current location"}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {t.location?.using ?? "Use GPS to detect your city"}
            </Text>
          </Pressable>

          <View className="h-px bg-slate-100 my-1" />

          <Pressable
            onPress={() => handleSelect("default")}
            className="px-3 py-2.5"
          >
            <Text className="text-sm font-semibold text-slate-800">
              {t.location?.default ?? "Default location"}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              Makkah, Saudi Arabia
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// components/LanguageSelector.tsx

import type { Locale } from "@/constants/i18n";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const LOCALES: { code: Locale; flag: string }[] = [
  { code: "es", flag: "🇪🇸" },
  { code: "en", flag: "🇬🇧" },
  { code: "fr", flag: "🇫🇷" },
  { code: "nl", flag: "🇳🇱" },
];

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelect = (code: Locale) => {
    setOpen(false);
    if (code !== locale) {
      setLocale(code);
    }
  };

  return (
    <View className="relative">
      {/* Botón principal */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center bg-white/90 rounded-3xl border border-slate-200 px-3 py-2 shadow-sm"
      >
        <Text className="text-xl mr-2">{current.flag}</Text>
        <Text className="text-sm font-semibold text-slate-800 mr-1" numberOfLines={1}>
          {t.languages[current.code]}
        </Text>
        <Text className="text-slate-400 text-lg">▾</Text>
      </Pressable>

      {/* Dropdown */}
      {open && (
        <View className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-10">
          {LOCALES.map((l) => {
            const isActive = l.code === locale;
            return (
              <Pressable
                key={l.code}
                onPress={() => handleSelect(l.code)}
                className="flex-row items-center px-3 py-2"
              >
                <Text className="text-lg mr-2">{l.flag}</Text>
                <Text
                  className={`text-sm ${
                    isActive ? "font-semibold text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {t.languages[l.code]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

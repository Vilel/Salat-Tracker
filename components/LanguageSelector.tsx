// components/LanguageSelector.tsx

import { Pressable, Text, View } from "react-native";
import type { Locale } from "../constants/i18n";
import { useLanguage } from "../contexts/language-context";

const LOCALES: { code: Locale; flag: string }[] = [
  { code: "es", flag: "🇪🇸" },
  { code: "en", flag: "🇬🇧" },
  { code: "fr", flag: "🇫🇷" },
  { code: "nl", flag: "🇳🇱" },
];

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <View className="flex-row items-center justify-center gap-3 mt-4">
      {LOCALES.map((l) => {
        const isActive = l.code === locale;

        return (
          <Pressable
            key={l.code}
            onPress={() => setLocale(l.code)}
            className={`flex-row items-center px-3 py-2 rounded-full border ${
              isActive ? "bg-primary border-primary" : "bg-white border-neutral-300"
            }`}
          >
            <Text className="text-xl mr-2">{l.flag}</Text>
            <Text
              className={`text-sm ${
                isActive ? "text-primary-foreground font-semibold" : "text-neutral-700"
              }`}
            >
              {t.languages[l.code]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

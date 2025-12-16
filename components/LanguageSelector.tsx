// components/LanguageSelector.tsx

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    GestureResponderEvent,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";

import { Card, ThemedText } from "@/components/ui";
import type { Locale } from "@/constants/i18n";
import { Colors, type ColorSchemeName } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsRTL } from "@/hooks/use-is-rtl";

const LOCALES: { code: Locale; flag: string }[] = [
  { code: "es", flag: "🇪🇸" },
  { code: "en", flag: "🇬🇧" },
  { code: "fr", flag: "🇫🇷" },
  { code: "nl", flag: "🇳🇱" },
  { code: "ar", flag: "🇸🇦" },
  { code: "ru", flag: "🇷🇺" },
  { code: "tr", flag: "🇹🇷" },
];

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const isRTL = useIsRTL();

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const containerBgClass = isDark ? "bg-app-card-dark" : "bg-app-card-light";
  const borderClass = isDark ? "border-app-border-dark" : "border-app-border-light";
  const primaryTextClass = isDark ? "text-app-primary-dark" : "text-app-primary-light";
  const pressedRowClass = isDark
    ? "active:bg-app-border-dark/40"
    : "active:bg-app-border-light/40";
  const selectedRowClass = isDark ? "bg-app-primary-dark/10" : "bg-app-primary-light/10";

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelect = (code: Locale) => {
    setOpen(false);
    if (code !== locale) {
      setLocale(code);
    }
  };

  const stopPressPropagation = (e: GestureResponderEvent) => {
    e.stopPropagation();
  };

  return (
    <View>
      {/* --- BOTÓN ACTIVADOR --- */}
      <Pressable
        onPress={() => setOpen(true)}
        className={[
          "items-center rounded-full border px-4 py-2 active:opacity-70 active:scale-95",
          isRTL ? "flex-row-reverse" : "flex-row",
          containerBgClass,
          borderClass,
        ].join(" ")}
      >
        <Text className={[isRTL ? "ml-2" : "mr-2", "text-[18px]"].join(" ")}>
          {current.flag}
        </Text>

        <ThemedText
          variant="small"
          className={[isRTL ? "ml-2" : "mr-2", "font-semibold"].join(" ")}
        >
          {current.code.toUpperCase()}
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
        {/* Backdrop */}
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setOpen(false)}
        >
          {/* Contenido del modal */}
          <Pressable onPress={stopPressPropagation}>
            <Card
              variant="elevated"
              className="w-[280px] rounded-3xl overflow-hidden p-0"
            >
              {/* Header del modal */}
              <View
                className={["px-5 py-4 border-b", borderClass].join(" ")}
              >
                <ThemedText variant="default" className="font-bold text-center">
                  {t.settings.language}
                </ThemedText>
              </View>

              {/* Lista de opciones */}
              <View className="py-2">
                {LOCALES.map((l) => {
                  const isActive = l.code === locale;
                  return (
                    <Pressable
                      key={l.code}
                      onPress={() => handleSelect(l.code)}
                      className={[
                        "mx-2 mb-1 items-center rounded-xl px-5 py-3",
                        isRTL ? "flex-row-reverse" : "flex-row",
                        isActive ? selectedRowClass : pressedRowClass,
                      ].join(" ")}
                    >
                      <Text className={[isRTL ? "ml-4" : "mr-4", "text-[24px]"].join(" ")}>
                        {l.flag}
                      </Text>

                      <View className="flex-1">
                        <ThemedText
                          variant="default"
                          className={[
                            "font-medium",
                            isActive ? primaryTextClass : "",
                          ].join(" ")}
                          align={isRTL ? "right" : "left"}
                        >
                          {t.languages[l.code]}
                        </ThemedText>
                      </View>

                      {isActive && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

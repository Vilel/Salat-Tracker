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

import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import type { Locale } from "@/constants/i18n";
import { Colors, type ColorSchemeName } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
];

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

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
        className="flex-row items-center rounded-full border px-4 py-2"
        style={({ pressed }) => ({
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text style={{ fontSize: 18, marginRight: 8 }}>{current.flag}</Text>

        <ThemedText
          variant="small"
          className="font-semibold mr-2"
          style={{ fontWeight: "600" }}
        >
          {current.code.toUpperCase()}
        </ThemedText>

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
        {/* Backdrop */}
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setOpen(false)}
        >
          {/* Contenido del modal */}
          <Pressable onPress={stopPressPropagation}>
            <Card
              variant="elevated"
              className="w-[280px] rounded-3xl overflow-hidden p-0"
              style={{ padding: 0 }}
            >
              {/* Header del modal */}
              <View
                className="px-5 py-4 border-b"
                style={{ borderBottomColor: theme.border }}
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
                      className="flex-row items-center px-5 py-3 mx-2 rounded-xl mb-1"
                      style={({ pressed }) => ({
                        backgroundColor: isActive
                          ? theme.primary + "22" // leve resaltado
                          : pressed
                          ? theme.background
                          : "transparent",
                      })}
                    >
                      <Text style={{ fontSize: 24, marginRight: 16 }}>
                        {l.flag}
                      </Text>

                      <View className="flex-1">
                        <ThemedText
                          variant="default"
                          className="font-medium"
                          color={isActive ? theme.primary : theme.text}
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

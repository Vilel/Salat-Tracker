import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedText } from "./ui/ThemedText";

type NavKey = "home" | "salats" | "qada" | "settings";

type NavItem = {
  key: NavKey;
  href: "/" | "/salats" | "/qada" | "/settings";
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];

  const pathname = usePathname();

  const items: NavItem[] = [
    {
      key: "home",
      href: "/",
      icon: "home-outline",
      label: t.navigation.home,
    },
    {
      key: "salats",
      href: "/salats",
      icon: "checkmark-done-outline",
      label: t.navigation.mySalats,
    },
    {
      key: "qada",
      href: "/qada",
      icon: "time-outline",
      label: t.navigation.qada,
    },
    {
      key: "settings",
      href: "/settings",
      icon: "settings-outline",
      label: t.settings?.title ?? "Settings",
    },
  ];

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingBottom: insets.bottom || 8,
      }}
    >
      <View className="flex-row">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/" &&
              (pathname === "/" || pathname === ""));

          const iconColor = isActive
            ? theme.primary
            : theme.textMuted;
          const textColor = isActive
            ? theme.primary
            : theme.textMuted;

          return (
            <Link key={item.key} href={item.href} asChild>
              <Pressable
                className="flex-1 items-center justify-center"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  paddingVertical: 8,
                })}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={iconColor}
                />
                <ThemedText
                  variant="small"
                  style={{
                    marginTop: 2,
                    fontWeight: isActive ? "700" : "500",
                    color: textColor,
                    fontSize: 10
                  }}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

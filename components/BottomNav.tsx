import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
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
  const router = useRouter();

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const activeTextClass = isDark ? "text-app-primary-dark" : "text-app-primary-light";
  const inactiveTextClass = isDark ? "text-app-textMuted-dark" : "text-app-textMuted-light";
  const containerBgClass = isDark ? "bg-app-card-dark" : "bg-app-card-light";
  const borderClass = isDark ? "border-app-border-dark" : "border-app-border-light";

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
      label: t.settings.title,
    },
  ];

  return (
    <View
      className={["border-t", containerBgClass, borderClass].join(" ")}
      style={{ paddingBottom: insets.bottom || 8 }}
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

          return (
            <Pressable
              key={item.key}
              className="flex-1 items-center justify-center py-2 active:opacity-70"
              onPress={() => {
                if (isActive) return;
                router.replace(item.href);
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={iconColor}
              />
              <ThemedText
                variant="small"
                color={isActive ? theme.primary : theme.textMuted}
                className={[
                  "mt-0.5 text-[10px]",
                  isActive ? "font-bold" : "font-medium",
                ].join(" ")}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

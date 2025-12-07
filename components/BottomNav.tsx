// components/BottomNav.tsx

import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    Colors,
    FontSizes,
    type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type NavKey = "home" | "salats";

type NavItem = {
  key: NavKey;
  href: "/" | "/salats"; // 👈 coincide con index.tsx y salats.tsx
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
  ];

  return (
    <View
      style={{
        backgroundColor: theme.background,
        paddingBottom: (insets.bottom || 10) + 4,
        paddingTop: 4,
      }}
    >
      <View
        className="mx-6 flex-row items-center rounded-full px-4 py-2"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 16,
        }}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/" && (pathname === "/" || pathname === ""));

          const iconColor = isActive ? theme.primary : theme.textMuted;
          const textColor = isActive ? theme.primary : theme.textMuted;

          return (
            <Link
              key={item.key}
              href={item.href}
              asChild
            >
              <Pressable
                className="flex-1 items-center justify-center"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  className="items-center justify-center rounded-2xl px-3 py-1.5"
                  style={{
                    backgroundColor: isActive
                      ? theme.primarySoft
                      : "transparent",
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={iconColor}
                  />
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: FontSizes.xs,
                      fontWeight: isActive ? "700" : "500",
                      color: textColor,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

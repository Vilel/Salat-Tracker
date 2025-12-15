import React from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedText } from "./ThemedText";

export type ButtonProps = PressableProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  className,
  ...rest
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const base = "flex-row items-center justify-center rounded-xl gap-2";
  const padding =
    size === "sm" ? "px-4 py-2" : size === "lg" ? "px-8 py-4" : "px-6 py-3";
  const textSize =
    size === "sm" ? "text-[16px] leading-5" : size === "lg" ? "text-[20px] leading-7" : "text-[18px] leading-6";

  const primaryBg = isDark ? "bg-app-primary-dark" : "bg-app-primary-light";
  const primarySoftBg = isDark ? "bg-app-primarySoft-dark" : "bg-app-primarySoft-light";
  const primaryText = isDark ? "text-app-primary-dark" : "text-app-primary-light";
  const disabledBg = isDark ? "bg-app-border-dark" : "bg-app-border-light";
  const disabledText = isDark ? "text-app-textMuted-dark" : "text-app-textMuted-light";

  const containerVariantClass =
    variant === "primary"
      ? primaryBg
      : variant === "secondary"
      ? primarySoftBg
      : "bg-transparent";

  const borderClass =
    variant === "outline"
      ? `border ${isDark ? "border-app-primary-dark" : "border-app-primary-light"}`
      : "border border-transparent";

  const textVariantClass =
    variant === "primary"
      ? "text-white"
      : variant === "secondary"
      ? primaryText
      : variant === "outline" || variant === "ghost"
      ? primaryText
      : "text-white";

  const spinnerColor =
    disabled || loading ? theme.textMuted : variant === "primary" ? "#FFFFFF" : theme.primary;

  return (
    <Pressable
      disabled={disabled || loading}
      className={[
        base,
        padding,
        borderClass,
        disabled || loading ? `${disabledBg} opacity-70` : `${containerVariantClass} active:opacity-90`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style as ViewStyle}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {leftIcon}
          <ThemedText
            className={[
              "font-semibold text-center",
              textSize,
              disabled ? disabledText : textVariantClass,
            ].join(" ")}
          >
            {label}
          </ThemedText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

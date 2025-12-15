import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

export type CardProps = ViewProps & {
  variant?: 'elevated' | 'outlined' | 'flat';
  className?: string;
};

export function Card({
  className,
  style,
  variant = "elevated",
  ...otherProps
}: CardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const base = "rounded-3xl p-5";
  const bg = isDark ? "bg-app-card-dark" : "bg-app-card-light";
  const outline =
    variant === "outlined"
      ? isDark
        ? "border border-app-border-dark"
        : "border border-app-border-light"
      : "";
  const shadow = variant === "elevated" ? "shadow-lg" : "";

  return (
    <View
      className={[base, bg, outline, shadow, className].filter(Boolean).join(" ")}
      style={style}
      {...otherProps}
    />
  );
}

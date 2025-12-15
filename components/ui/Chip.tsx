import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ThemedText } from "./ThemedText";

export type ChipProps = ViewProps & {
  label: string;
  variant?: "muted" | "primary";
  size?: "sm" | "md";
  className?: string;
};

export function Chip({
  label,
  variant = "muted",
  size = "sm",
  style,
  className,
  ...rest
}: ChipProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const paddingClass = size === "md" ? "px-2.5 py-1.5" : "px-2 py-1";
  const bgClass =
    variant === "primary"
      ? isDark
        ? "bg-app-primary-dark/15"
        : "bg-app-primary-light/10"
      : isDark
      ? "bg-app-border-dark/60"
      : "bg-app-border-light/60";
  const textClass =
    variant === "primary"
      ? isDark
        ? "text-app-primary-dark"
        : "text-app-primary-light"
      : isDark
      ? "text-app-textMuted-dark"
      : "text-app-textMuted-light";

  return (
    <View
      className={["shrink-0 rounded-full max-w-full", paddingClass, bgClass, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <ThemedText
        variant="small"
        className={["text-[11px] font-bold tracking-[0.2px]", textClass].join(" ")}
        numberOfLines={1}
      >
        {label}
      </ThemedText>
    </View>
  );
}

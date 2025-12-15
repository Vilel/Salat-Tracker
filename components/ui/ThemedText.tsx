import { Text, type TextProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

export type ThemedTextProps = TextProps & {
  variant?: 'default' | 'title' | 'subtitle' | 'link' | 'small' | 'label';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  className?: string;
};

export function ThemedText({
  style,
  variant = 'default',
  color,
  align = 'auto',
  className,
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === "dark";

  const baseClass =
    variant === "title"
      ? "text-[32px] leading-[40px] font-bold"
      : variant === "subtitle"
      ? "text-[22px] leading-[28px] font-semibold"
      : variant === "small"
      ? "text-[14px] leading-5"
      : variant === "label"
      ? "text-[16px] leading-[22px] font-medium"
      : variant === "link"
      ? "text-[18px] leading-[26px] underline"
      : "text-[18px] leading-[26px]";

  const defaultColorClass =
    variant === "link"
      ? isDark
        ? "text-app-primary-dark"
        : "text-app-primary-light"
      : isDark
      ? "text-app-text-dark"
      : "text-app-text-light";

  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : align === "justify"
      ? "text-justify"
      : "";

  return (
    <Text
      className={[baseClass, defaultColorClass, alignClass, className]
        .filter(Boolean)
        .join(" ")}
      style={[
        // NOTE: We keep `color`/`style` for backwards-compat, but we prefer `className` everywhere else.
        color ? { color } : null,
        style,
      ]}
      {...rest}
    />
  );
}

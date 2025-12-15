import type { ReactNode } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ThemedText } from "./ThemedText";

export type ListRowProps = Omit<PressableProps, "style"> & {
  left?: ReactNode;
  title: string;
  description?: string;
  right?: ReactNode;
  tone?: "default" | "selected";
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  className?: string;
  titleClassName?: string;
};

export function ListRow({
  left,
  title,
  description,
  right,
  tone = "default",
  containerStyle,
  titleStyle,
  className,
  titleClassName,
  ...rest
}: ListRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const hasDescription = !!description;

  const alignClass = hasDescription ? "items-start" : "items-center";
  const pressedBg = isDark
    ? "active:bg-app-border-dark/40"
    : "active:bg-app-border-light/40";
  const selectedBg = isDark
    ? "bg-app-primary-dark/10"
    : "bg-app-primary-light/10";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";

  return (
    <Pressable
      accessibilityRole="button"
      className={[
        "self-stretch w-full flex-row flex-nowrap rounded-xl px-3 py-3",
        alignClass,
        tone === "selected" ? selectedBg : pressedBg,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={containerStyle}
      {...rest}
    >
      {/* LEFT + TEXT */}
      <View className={["flex-1 min-w-0 flex-row", alignClass].join(" ")}>
        {left ? (
          <View
            className={[
              "shrink-0 mr-4",
              hasDescription ? "mt-0.5" : "",
            ].filter(Boolean).join(" ")}
          >
            {left}
          </View>
        ) : null}

        <View className={["flex-1 min-w-0", hasDescription ? "justify-start" : "justify-center"].join(" ")}>
          <ThemedText
            variant="default"
            className={["font-semibold", titleClassName].filter(Boolean).join(" ")}
            style={titleStyle}
            numberOfLines={1}
          >
            {title}
          </ThemedText>

          {description ? (
            <ThemedText
              variant="small"
              numberOfLines={1}
              className={["mt-0.5", mutedTextClass].join(" ")}
            >
              {description}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {/* RIGHT */}
      {right ? (
        <View className={[
          "ml-3 shrink-0 flex-row justify-end",
          alignClass,
          hasDescription ? "mt-0.5" : "",
        ].filter(Boolean).join(" ")}>
          {right}
        </View>
      ) : null}
    </Pressable>
  );
}

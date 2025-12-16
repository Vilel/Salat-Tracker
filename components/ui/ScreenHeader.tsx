import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsRTL } from "@/hooks/use-is-rtl";

import { ThemedText } from "./ThemedText";

export type ScreenHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  style,
  className,
  ...rest
}: ScreenHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const isRTL = useIsRTL();
  const mutedClass = isDark ? "text-app-textMuted-dark" : "text-app-textMuted-light";

  return (
    <View
      className={[
        "mt-2 mb-6 items-start justify-between gap-3",
        isRTL ? "flex-row-reverse" : "flex-row",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <View className="flex-1 min-w-0">
        <ThemedText
          variant="title"
          className="text-[28px] leading-[34px]"
          align={isRTL ? "right" : "left"}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            variant="default"
            className={["mt-1", mutedClass].join(" ")}
            align={isRTL ? "right" : "left"}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  );
}



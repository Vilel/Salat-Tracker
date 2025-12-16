import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsRTL } from "@/hooks/use-is-rtl";

import { ThemedText } from "./ThemedText";

export type SectionHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  right,
  style,
  className,
  ...rest
}: SectionHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const isRTL = useIsRTL();
  const mutedClass = isDark ? "text-app-textMuted-dark" : "text-app-textMuted-light";

  return (
    <View
      className={[
        "items-start justify-between gap-3",
        isRTL ? "flex-row-reverse" : "flex-row",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <View className="flex-1">
        <ThemedText variant="subtitle" align={isRTL ? "right" : "left"}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            variant="small"
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



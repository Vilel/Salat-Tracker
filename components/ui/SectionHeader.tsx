import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

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
  const mutedClass = isDark ? "text-app-textMuted-dark" : "text-app-textMuted-light";

  return (
    <View
      className={["flex-row items-start justify-between gap-3", className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <View className="flex-1">
        <ThemedText variant="subtitle">{title}</ThemedText>
        {subtitle ? (
          <ThemedText
            variant="small"
            className={["mt-1", mutedClass].join(" ")}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  );
}



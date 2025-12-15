import type { ReactNode } from "react";
import { Switch, View, type SwitchProps, type ViewProps } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { ThemedText } from "./ThemedText";

export type ToggleRowProps = Omit<ViewProps, "children"> & {
  left?: ReactNode;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: NonNullable<SwitchProps["onValueChange"]>;
  disabled?: boolean;
  className?: string;
};

export function ToggleRow({
  left,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
  className,
  ...rest
}: ToggleRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";

  return (
    <View
      className={[
        "flex-row items-center justify-between py-2.5",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value, disabled }}
      {...rest}
    >
      <View
        className="flex-1 min-w-0 flex-row items-center gap-3 mr-2.5"
      >
        {left ? <View className="shrink-0">{left}</View> : null}

        <View className="flex-1 min-w-0">
          <ThemedText
            variant="default"
            className="font-semibold"
            numberOfLines={1}
          >
            {title}
          </ThemedText>
          {description ? (
            <ThemedText variant="small" className={mutedTextClass} numberOfLines={1}>
              {description}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={"#fff"}
      />
    </View>
  );
}



import type { ReactNode } from "react";
import { Switch, View, type SwitchProps, type ViewProps } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsRTL } from "@/hooks/use-is-rtl";

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
  const isRTL = useIsRTL();
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";

  return (
    <View
      className={[
        "items-center justify-between py-2.5",
        isRTL ? "flex-row-reverse" : "flex-row",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value, disabled }}
      {...rest}
    >
      <View
        className={[
          "flex-1 min-w-0 items-center gap-3",
          isRTL ? "flex-row-reverse ml-2.5" : "flex-row mr-2.5",
        ].join(" ")}
      >
        {left ? <View className="shrink-0">{left}</View> : null}

        <View className="flex-1 min-w-0">
          <ThemedText
            variant="default"
            className="font-semibold"
            numberOfLines={1}
            align={isRTL ? "right" : "left"}
          >
            {title}
          </ThemedText>
          {description ? (
            <ThemedText
              variant="small"
              className={mutedTextClass}
              numberOfLines={1}
              align={isRTL ? "right" : "left"}
            >
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



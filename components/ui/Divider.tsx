import { View, type ViewProps } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

export type DividerProps = ViewProps & {
  inset?: number;
  insetClassName?: string;
  className?: string;
};

export function Divider({
  style,
  inset = 0,
  insetClassName,
  className,
  ...rest
}: DividerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const dividerClass = isDark ? "bg-app-border-dark" : "bg-app-border-light";

  return (
    <View
      className={["h-px", dividerClass, insetClassName, className].filter(Boolean).join(" ")}
      style={[inset ? { marginLeft: inset } : null, style]}
      {...rest}
    />
  );
}



import { ScrollView, View, type ScrollViewProps, type ViewProps } from "react-native";
import { SafeAreaView, type SafeAreaViewProps } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";

type ScreenLayoutProps = ViewProps & {
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  contentContainerClassName?: string;
  safeAreaEdges?: SafeAreaViewProps['edges'];
  padding?: boolean; // Default true, adds standard screen padding
  className?: string;
};

export function ScreenLayout({
  children,
  style,
  scrollable = true,
  contentContainerStyle,
  contentContainerClassName,
  safeAreaEdges = ['top', 'left', 'right'], // Usually we want to handle bottom manually or let it flow
  padding = true,
  className,
  ...rest
}: ScreenLayoutProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const bgClass = isDark ? "bg-app-background-dark" : "bg-app-background-light";
  const paddingClass = padding ? "px-4 py-4" : "";

  return (
    <SafeAreaView
      className={["flex-1", bgClass, className].filter(Boolean).join(" ")}
      style={style}
      edges={safeAreaEdges}
      {...rest}
    >
      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={["flex-grow", paddingClass, contentContainerClassName].filter(Boolean).join(" ")}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          className={["flex-1", paddingClass, contentContainerClassName].filter(Boolean).join(" ")}
          style={contentContainerStyle}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}


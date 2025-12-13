import React from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ScreenLayoutProps = ViewProps & {
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  safeAreaEdges?: SafeAreaViewProps['edges'];
  padding?: boolean; // Default true, adds standard screen padding
};

export function ScreenLayout({
  children,
  style,
  scrollable = true,
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right'], // Usually we want to handle bottom manually or let it flow
  padding = true,
  ...rest
}: ScreenLayoutProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const Container = scrollable ? ScrollView : View;
  
  // For ScrollView, we pass contentContainerStyle. For View, we might just pass style.
  // But to unify, we'll wrap the inner content.

  const paddingStyle = padding ? { paddingHorizontal: 16, paddingVertical: 16 } : {};

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: theme.background }, style]}
      edges={safeAreaEdges}
      {...rest}
    >
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { flexGrow: 1 },
            paddingStyle,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, paddingStyle, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}


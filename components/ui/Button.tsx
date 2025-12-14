import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    type PressableProps,
    type StyleProp,
    type ViewStyle
} from 'react-native';

import { Colors, FontSizes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './ThemedText';

export type ButtonProps = PressableProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return theme.border;

    switch (variant) {
      case 'primary':
        return pressed ? theme.primary + 'CC' : theme.primary;
      case 'secondary':
        return pressed ? theme.primarySoft + 'CC' : theme.primarySoft;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;

    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return theme.primary;
      case 'outline':
      case 'ghost':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (variant === 'outline') return theme.primary;
    return 'transparent';
  };

  const paddingVertical = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const paddingHorizontal = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;
  const fontSize = size === 'sm' ? FontSizes.sm : size === 'lg' ? FontSizes.lg : FontSizes.base;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical,
          paddingHorizontal,
          opacity: disabled || loading ? 0.7 : 1,
          gap: 8, // Modern Flexbox gap
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <ThemedText
            style={{
              color: getTextColor(),
              fontSize,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {label}
          </ThemedText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});

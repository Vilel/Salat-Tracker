import { View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type CardProps = ViewProps & {
  variant?: 'elevated' | 'outlined' | 'flat';
};

export function Card({ style, variant = 'elevated', ...otherProps }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const backgroundColor = theme.card;
  const borderColor = theme.border;

  // Shadow styles for iOS and Android
  const shadowStyle =
    variant === 'elevated'
      ? {
          shadowColor: colorScheme === 'dark' ? '#000' : '#1e293b',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 4,
        }
      : {};

  const borderStyle =
    variant === 'outlined'
      ? {
          borderWidth: 1,
          borderColor,
        }
      : {};

  return (
    <View
      style={[
        { backgroundColor, borderRadius: 24, padding: 20 },
        shadowStyle,
        borderStyle,
        style,
      ]}
      {...otherProps}
    />
  );
}

import { Text, type TextProps, StyleSheet } from 'react-native';

import { Colors, FontSizes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedTextProps = TextProps & {
  variant?: 'default' | 'title' | 'subtitle' | 'link' | 'small' | 'label';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
};

export function ThemedText({
  style,
  variant = 'default',
  color,
  align = 'auto',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const textColor = color ?? (variant === 'link' ? theme.primary : theme.text);

  return (
    <Text
      style={[
        { color: textColor, textAlign: align },
        variant === 'default' && styles.default,
        variant === 'title' && styles.title,
        variant === 'subtitle' && styles.subtitle,
        variant === 'link' && styles.link,
        variant === 'small' && styles.small,
        variant === 'label' && styles.label,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.base,
    lineHeight: 24,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  link: {
    fontSize: FontSizes.base,
    lineHeight: 30,
    textDecorationLine: 'underline',
  },
  small: {
    fontSize: FontSizes.xs,
    lineHeight: 20,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
});


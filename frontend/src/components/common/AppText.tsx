import type { PropsWithChildren } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native';

import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

type AppTextProps = PropsWithChildren<{
  variant?: 'title' | 'sectionTitle' | 'body' | 'caption' | 'priceHero';
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}>;

export function AppText({ children, muted, style, variant = 'body' }: AppTextProps) {
  return (
    <Text
      style={[
        {
          color: muted ? colors.textSecondary : colors.textPrimary,
          fontSize: typography[variant],
          lineHeight: lineHeightFor(variant),
        },
        (variant === 'title' || variant === 'sectionTitle' || variant === 'priceHero') && {
          fontWeight: '800',
        },
        variant === 'caption' && { fontWeight: '600' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

function lineHeightFor(variant: NonNullable<AppTextProps['variant']>): number {
  switch (variant) {
    case 'title':
      return 36;
    case 'sectionTitle':
      return 28;
    case 'priceHero':
      return 42;
    case 'caption':
      return 18;
    default:
      return 23;
  }
}

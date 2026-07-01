import type { PropsWithChildren } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native';

import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

type AppTextProps = PropsWithChildren<{
  variant?:
    | 'title'
    | 'screenTitle'
    | 'sectionTitle'
    | 'cardTitle'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'micro'
    | 'button'
    | 'priceHero'
    | 'priceLarge'
    | 'priceMedium';
  muted?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}>;

export function AppText({ children, muted, numberOfLines, style, variant = 'body' }: AppTextProps) {
  const textStyle = typography[variant];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: muted ? colors.textSecondary : colors.textPrimary,
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          lineHeight: textStyle.lineHeight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

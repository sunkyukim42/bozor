import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { shadows } from '@/src/constants/shadows';
import { spacing } from '@/src/constants/spacing';

export function AppCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
});

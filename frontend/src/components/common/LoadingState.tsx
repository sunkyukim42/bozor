import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';

export function LoadingState({
  label = 'Loading price data...',
  compact = false,
  title,
}: {
  label?: string;
  compact?: boolean;
  title?: string;
}) {
  return (
    <AppCard style={[styles.wrap, compact && styles.compact]}>
      <ActivityIndicator color={colors.primary} />
      <View style={styles.textBlock}>
        {title ? <AppText variant="cardTitle">{title}</AppText> : null}
        <AppText muted>{label}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  compact: {
    padding: spacing.md,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
});

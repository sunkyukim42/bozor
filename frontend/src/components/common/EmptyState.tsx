import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

export const emptyStateMessages = {
  limitedData: 'Limited data. Use as reference.',
  marketData: 'No recent market data yet.',
  noReports: 'No reports yet.',
  search: 'No reliable match found.',
} as const;

export function EmptyState({
  actionLabel,
  message,
  onAction,
  title = 'No data yet',
}: {
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <AppText variant="cardTitle">{title}</AppText>
      <AppText muted style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? <AppButton title={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    textAlign: 'center',
  },
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
});

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';

export function LoadingState({ label = 'Loading...', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <ActivityIndicator color={colors.primary} />
      <AppText muted>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  compact: {
    padding: spacing.md,
  },
});

import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

export function EmptyState({ message, title = 'No data yet' }: { message: string; title?: string }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="cardTitle">{title}</AppText>
      <AppText muted>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.card,
    gap: spacing.xs,
    padding: spacing.xl,
  },
});

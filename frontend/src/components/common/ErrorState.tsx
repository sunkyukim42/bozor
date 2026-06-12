import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

export function ErrorState({
  message = 'We could not load price data. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <AppText variant="cardTitle" style={styles.title}>
        Error
      </AppText>
      <AppText muted>{message}</AppText>
      {onRetry ? <AppButton onPress={onRetry} title="Retry" variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.danger,
  },
  wrap: {
    backgroundColor: colors.softRed,
    borderRadius: radius.card,
    gap: spacing.xs,
    padding: spacing.lg,
  },
});

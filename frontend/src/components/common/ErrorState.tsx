import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

export const defaultErrorMessage = 'We could not load price data. Please try again.';

export function ErrorState({
  message = defaultErrorMessage,
  onRetry,
  retryLabel = 'Retry',
  title = 'Something went wrong',
}: {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon} />
      <AppText variant="cardTitle" style={styles.title}>
        {title}
      </AppText>
      <AppText muted style={styles.message}>
        {message}
      </AppText>
      {onRetry ? <AppButton onPress={onRetry} title={retryLabel} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    height: 8,
    width: 48,
  },
  message: {
    textAlign: 'center',
  },
  title: {
    color: colors.danger,
    textAlign: 'center',
  },
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.softRed,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
});

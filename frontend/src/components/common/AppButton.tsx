import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  leftIcon?: ReactNode;
};

export function AppButton({ disabled, leftIcon, loading, onPress, title, variant = 'primary' }: AppButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} /> : leftIcon}
        <AppText variant="button" style={[styles.label, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.52,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  label: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  secondaryText: {
    color: colors.primary,
  },
});

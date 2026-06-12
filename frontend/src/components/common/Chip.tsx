import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

type ChipProps = PropsWithChildren<{
  selected?: boolean;
  onPress?: () => void;
  muted?: boolean;
}>;

export function Chip({ children, muted, onPress, selected }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        muted && styles.muted,
        pressed && onPress && styles.pressed,
      ]}
    >
      <AppText variant="caption" style={[styles.text, selected && styles.selectedText]}>
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.82,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedText: {
    color: colors.white,
  },
  text: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});

import type { KeyboardTypeOptions } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

type AppInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

export function AppInput({ error, helperText, keyboardType, label, multiline, onChangeText, placeholder, value }: AppInputProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error && styles.errorBorder]}
        value={value}
      />
      {helperText && !error ? (
        <AppText variant="caption" muted>
          {helperText}
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="caption" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  errorBorder: {
    borderColor: colors.veryExpensive,
  },
  errorText: {
    color: colors.veryExpensive,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontWeight: '700',
  },
  multiline: {
    minHeight: 92,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  wrap: {
    gap: spacing.xs,
  },
});

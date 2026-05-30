import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

export type SelectOption = {
  label: string;
  value: string;
  caption?: string;
};

type AppSelectProps = {
  label: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export function AppSelect({ label, onSelect, options, selectedValue }: AppSelectProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.options}>
          {options.map((option) => {
            const selected = option.value === selectedValue;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={[styles.option, selected && styles.selectedOption]}
              >
                <AppText variant="caption" style={selected && styles.selectedText}>
                  {option.label}
                </AppText>
                {option.caption ? (
                  <AppText variant="caption" muted style={selected && styles.selectedText}>
                    {option.caption}
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '800',
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 2,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedText: {
    color: '#FFF',
  },
  wrap: {
    gap: spacing.sm,
  },
});

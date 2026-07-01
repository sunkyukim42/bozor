import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { Chip } from '@/src/components/common/Chip';
import { colors } from '@/src/constants/colors';
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
              <Chip key={option.value} onPress={() => onSelect(option.value)} selected={selected}>
                <AppText variant="caption" style={selected && styles.selectedText}>
                  {option.label}
                </AppText>
                {option.caption ? (
                  <AppText variant="caption" muted style={selected && styles.selectedCaption}>
                    {option.caption}
                  </AppText>
                ) : null}
              </Chip>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectedCaption: {
    color: colors.primaryLight,
  },
  selectedText: {
    color: colors.white,
  },
  wrap: {
    gap: spacing.sm,
  },
});

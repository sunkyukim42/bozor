import { StyleSheet, View } from 'react-native';

import { AppSelect } from '@/src/components/common/AppSelect';
import { AppText } from '@/src/components/common/AppText';
import { Chip } from '@/src/components/common/Chip';
import { spacing } from '@/src/constants/spacing';
import { formatUnitLabel } from '@/src/utils/unitLabels';

type UnitSelectorProps = {
  selectedUnit: string;
  units: string[];
  onSelect: (unit: string) => void;
  label?: string;
  mode?: 'select' | 'chips';
};

export function UnitSelector({ label = 'Unit', mode = 'select', onSelect, selectedUnit, units }: UnitSelectorProps) {
  if (mode === 'chips') {
    return (
      <View style={styles.wrap}>
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
        <View style={styles.chips}>
          {units.map((unit) => (
            <Chip key={unit} selected={unit === selectedUnit} onPress={() => onSelect(unit)}>
              {formatUnitLabel(unit)}
            </Chip>
          ))}
        </View>
      </View>
    );
  }

  return (
    <AppSelect
      label={label}
      onSelect={onSelect}
      options={units.map((unit) => ({ label: formatUnitLabel(unit), value: unit }))}
      selectedValue={selectedUnit}
    />
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
  },
  wrap: {
    gap: spacing.xs,
  },
});

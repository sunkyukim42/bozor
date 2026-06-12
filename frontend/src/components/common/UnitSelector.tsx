import { AppSelect } from '@/src/components/common/AppSelect';
import { formatUnitLabel } from '@/src/utils/unitLabels';

type UnitSelectorProps = {
  selectedUnit: string;
  units: string[];
  onSelect: (unit: string) => void;
  label?: string;
};

export function UnitSelector({ label = 'Unit', onSelect, selectedUnit, units }: UnitSelectorProps) {
  return (
    <AppSelect
      label={label}
      onSelect={onSelect}
      options={units.map((unit) => ({ label: formatUnitLabel(unit), value: unit }))}
      selectedValue={selectedUnit}
    />
  );
}

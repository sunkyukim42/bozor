const unitLabels: Record<string, string> = {
  BUNDLE: 'bundle',
  KG: 'kg',
  LITER: 'litre',
  PCS: 'pcs',
  PCS_10: '10 pcs',
};

export function formatUnitLabel(unit: string): string {
  return unitLabels[unit] ?? unit.toLowerCase();
}

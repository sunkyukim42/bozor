import { describe, expect, it } from '@jest/globals';

import { formatUnitLabel } from '@/src/utils/unitLabels';

describe('unit labels', () => {
  it('formats supported consumer unit labels', () => {
    expect(formatUnitLabel('KG')).toBe('kg');
    expect(formatUnitLabel('PCS_10')).toBe('10 pcs');
    expect(formatUnitLabel('LITER')).toBe('litre');
    expect(formatUnitLabel('BUNDLE')).toBe('bundle');
    expect(formatUnitLabel('PCS')).toBe('pcs');
  });

  it('falls back to a lowercase label for unknown unit values', () => {
    expect(formatUnitLabel('BOX')).toBe('box');
  });
});

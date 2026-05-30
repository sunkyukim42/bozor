import { describe, expect, it } from '@jest/globals';

import { getOverFairHighPercent, getPriceVerdict } from '@/src/utils/priceVerdict';

describe('price verdict', () => {
  it('returns CHEAP at or below fairLow', () => {
    expect(getPriceVerdict(14000, 14000, 18500)).toBe('CHEAP');
  });

  it('returns FAIR between fairLow and fairHigh', () => {
    expect(getPriceVerdict(16000, 14000, 18500)).toBe('FAIR');
  });

  it('returns EXPENSIVE up to fairHigh * 1.2', () => {
    expect(getPriceVerdict(22000, 14000, 18500)).toBe('EXPENSIVE');
  });

  it('returns VERY_EXPENSIVE above fairHigh * 1.2', () => {
    expect(getPriceVerdict(23000, 14000, 18500)).toBe('VERY_EXPENSIVE');
  });

  it('calculates overFairHighPercent only above fairHigh', () => {
    expect(getOverFairHighPercent(16000, 18500)).toBe(0);
    expect(getOverFairHighPercent(22000, 18500)).toBe(18.92);
  });
});

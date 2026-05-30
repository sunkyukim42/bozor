import { describe, expect, it } from '@jest/globals';

import { formatCurrency } from '@/src/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats UZS without decimals', () => {
    expect(formatCurrency(16000)).toBe('16,000 UZS');
  });
});

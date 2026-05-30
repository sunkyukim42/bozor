import { describe, expect, it } from '@jest/globals';

import { checkMockPrice, getMockProducts } from '@/src/api/mockApi';

describe('mock API', () => {
  (['tomato', 'pomidor', 'помидор'] as const).forEach((query) => {
    it(`finds TOMATO for query ${query}`, async () => {
      const products = await getMockProducts(query);
      expect(products.map((product) => product.code)).toContain('TOMATO');
    });
  });

  it('returns a verdict for TOMATO / TASHKENT_CHORSU / 22000', async () => {
    const result = await checkMockPrice({
      productCode: 'TOMATO',
      marketCode: 'TASHKENT_CHORSU',
      quotedPrice: 22000,
      unitCode: 'KG',
    });
    expect(result.verdict).toBe('EXPENSIVE');
    expect(result.recommendedTargetPrice).toBe(16500);
  });
});

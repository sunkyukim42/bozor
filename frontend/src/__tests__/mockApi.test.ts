import { describe, expect, it } from '@jest/globals';

import { checkMockPrice, createMockPriceReport, getMockProducts } from '@/src/api/mockApi';
import { SURVEY_LOCATION, findMockSummary } from '@/src/api/mockData';

describe('mock API', () => {
  (['tomato', 'pomidor', 'помидор'] as const).forEach((query) => {
    it(`finds TOMATO for query ${query}`, async () => {
      const products = await getMockProducts(query);
      expect(products.map((product) => product.code)).toContain('TOMATO');
    });
  });

  it('finds RICE for query rice', async () => {
    const products = await getMockProducts('rice');
    expect(products.map((product) => product.code)).toContain('RICE');
  });

  it('finds EGGS for query tuxum', async () => {
    const products = await getMockProducts('tuxum');
    expect(products.map((product) => product.code)).toContain('EGGS');
  });

  it('returns a verdict for TOMATO / TASHKENT_CHORSU / 22000', async () => {
    const result = await checkMockPrice({
      productCode: 'TOMATO',
      marketCode: 'TASHKENT_CHORSU',
      quotedPrice: 22000,
      unitCode: 'KG',
    });
    expect(result.verdict).toBe('VERY_EXPENSIVE');
    expect(result.recommendedTargetPrice).toBe(10000);
    expect(result.surveyDate).toBe('2026-06-05');
    expect(result.location).toBe(SURVEY_LOCATION);
    expect(result.dataSource).toBe('FIELD_SURVEY');
  });

  it('returns full survey location in survey-backed summary metadata', () => {
    const summary = findMockSummary('TOMATO', 'TASHKENT_CHORSU');
    expect(summary.surveyDate).toBe('2026-06-05');
    expect(summary.location).toBe(SURVEY_LOCATION);
  });

  it('returns PENDING for a mock price report', async () => {
    const report = await createMockPriceReport({
      productCode: 'RICE',
      marketCode: 'TASHKENT_CHORSU',
      submittedPrice: 15000,
      submittedUnit: 'KG',
    });
    expect(report.status).toBe('PENDING');
  });
});

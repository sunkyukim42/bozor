import { describe, expect, it } from '@jest/globals';

import { adaptMarket } from '@/src/api/adapters/marketAdapter';
import { adaptPriceCheck, adaptPriceHistory, adaptPriceSummary } from '@/src/api/adapters/priceAdapter';
import { adaptProduct } from '@/src/api/adapters/productAdapter';
import { adaptPriceReport } from '@/src/api/adapters/reportAdapter';

describe('API adapters', () => {
  it('normalizes product and market DTOs', () => {
    expect(
      adaptProduct({
        id: 'p1',
        code: 'TOMATO',
        nameKo: '토마토',
        nameEn: 'Tomato',
        nameUz: 'Pomidor',
        nameRu: 'Помидор',
        defaultUnit: 'KG',
        seasonal: true,
        active: true,
        aliases: [{ locale: 'uz', alias: 'pomidor' }],
      }),
    ).toMatchObject({ code: 'TOMATO', aliases: [{ alias: 'pomidor' }] });

    expect(
      adaptMarket({
        id: 'm1',
        code: 'TASHKENT_CHORSU',
        name: 'Chorsu Bazaar',
        latitude: '41.326',
        longitude: '69.234',
        marketType: 'BAZAAR',
        active: true,
      }),
    ).toMatchObject({ code: 'TASHKENT_CHORSU', latitude: 41.326, marketType: 'BAZAAR' });
  });

  it('normalizes price summary and source breakdown', () => {
    const summary = adaptPriceSummary({
      productCode: 'TOMATO',
      marketCode: 'TASHKENT_CHORSU',
      summaryDate: '2026-05-30',
      fairLow: '15000',
      fairMid: '16000',
      fairHigh: '17000',
      sampleCount: 3,
      confidenceScore: '0.725',
      sourceBreakdown: { FIELD_SURVEY: '2', KORZINKA_REFERENCE: 1 },
      surveyDate: '2026-06-05',
      location: 'Chorsu Bazaar and Korzinka, Tashkent',
      dataSource: 'FIELD_SURVEY',
      dataNote: 'Field survey/reference data for real API development; not live pricing.',
    });

    expect(summary).toMatchObject({
      fairLow: 15000,
      fairMid: 16000,
      fairHigh: 17000,
      sourceBreakdown: { FIELD_SURVEY: 2, KORZINKA_REFERENCE: 1 },
      surveyDate: '2026-06-05',
      location: 'Chorsu Bazaar and Korzinka, Tashkent',
      dataSource: 'FIELD_SURVEY',
    });
  });

  it('normalizes string source breakdown from backend JSON columns', () => {
    const summary = adaptPriceSummary({
      productCode: 'TOMATO',
      marketCode: 'KORZINKA_ONLINE',
      fairLow: 7990,
      fairMid: 10490,
      fairHigh: 12990,
      sourceBreakdown: '{"KORZINKA_REFERENCE":1}',
      dataSource: 'KORZINKA_REFERENCE',
    });

    expect(summary.sourceBreakdown).toEqual({ KORZINKA_REFERENCE: 1 });
    expect(summary.dataSource).toBe('KORZINKA_REFERENCE');
  });

  it('normalizes price history arrays', () => {
    const history = adaptPriceHistory({
      productCode: 'TOMATO',
      marketCode: 'TASHKENT_CHORSU',
      from: '2026-05-01',
      to: '2026-05-30',
      grain: 'DAILY',
      summaries: [{ productCode: 'TOMATO', marketCode: 'TASHKENT_CHORSU', fairMid: 16000 }],
    });

    expect(history.summaries).toHaveLength(1);
    expect(history.summaries[0].fairMid).toBe(16000);
  });

  it('combines backend price check response with summary display metadata', () => {
    const summary = adaptPriceSummary({
      productCode: 'TOMATO',
      marketCode: 'TASHKENT_CHORSU',
      fairLow: 15000,
      fairMid: 16000,
      fairHigh: 17000,
      sampleCount: 3,
      sourceBreakdown: { FIELD_SURVEY: 2, USER_REPORT: 1 },
      surveyDate: '2026-06-05',
      location: 'Chorsu Bazaar and Korzinka, Tashkent',
      dataSource: 'FIELD_SURVEY',
    });

    const result = adaptPriceCheck(
      {
        productCode: 'TOMATO',
        marketCode: 'TASHKENT_CHORSU',
        quotedPrice: 22000,
        unitCode: 'KG',
        fairLow: 15000,
        fairMid: 16000,
        fairHigh: 17000,
        verdict: 'VERY_EXPENSIVE',
        recommendedTargetPrice: 16000,
        overFairHighPercent: 29.41,
        confidenceScore: 0.725,
        sampleCount: 1,
        sourceBreakdown: { FIELD_SURVEY: 1 },
        surveyDate: '2026-06-05',
        location: 'Chorsu Bazaar and Korzinka, Tashkent',
        dataSource: 'FIELD_SURVEY',
        dataNote: 'Field survey/reference data for real API development; not live pricing.',
      },
      summary,
    );

    expect(result).toMatchObject({
      verdict: 'VERY_EXPENSIVE',
      sampleCount: 1,
      sourceBreakdown: { FIELD_SURVEY: 1 },
      surveyDate: '2026-06-05',
      location: 'Chorsu Bazaar and Korzinka, Tashkent',
      dataSource: 'FIELD_SURVEY',
    });
  });

  it('normalizes public report response as PENDING', () => {
    expect(
      adaptPriceReport({
        id: 'r1',
        status: 'PENDING',
        productCode: 'TOMATO',
        marketCode: 'TASHKENT_CHORSU',
        submittedPrice: '16000',
        submittedUnit: 'KG',
        normalizedObservationId: null,
        submittedAt: '2026-05-30T10:00:00Z',
      }),
    ).toMatchObject({ status: 'PENDING', submittedPrice: 16000 });
  });
});

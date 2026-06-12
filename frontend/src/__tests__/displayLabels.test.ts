import { describe, expect, it } from '@jest/globals';

import type { ProductNormalizeResponse } from '@/src/api/agentTypes';
import {
  formatConfidenceLabel,
  formatDataContext,
  formatMarketLocation,
  formatMarketTypeLabel,
  formatProductMatchConfidence,
  formatProductMatchTitle,
  formatProductSubtitle,
  formatSourceLabel,
  formatSourceSummary,
  formatSurveyMetadata,
  formatUpdatedLabel,
  formatVariantLabel,
  getFairRangeDisplay,
  getPriceCheckDisplayMetrics,
} from '@/src/utils/displayLabels';

describe('display labels', () => {
  it('maps fair price fields into consumer-safe labels', () => {
    expect(getFairRangeDisplay({ fairLow: 9500, fairMid: 10000, fairHigh: 10500 })).toEqual({
      lowPrice: 9500,
      typicalPrice: 10000,
      highPrice: 10500,
    });
  });

  it('formats source and confidence labels without raw source codes', () => {
    expect(formatSourceLabel('FIELD_SURVEY')).toBe('Based on field survey data');
    expect(formatSourceLabel('KORZINKA_REFERENCE')).toBe('Reference data');
    expect(formatConfidenceLabel(0.58)).toBe('Moderate confidence (58%)');
  });

  it('formats limited data and survey metadata', () => {
    expect(formatDataContext({ sampleCount: 1 })).toBe('Limited data');
    expect(formatUpdatedLabel('2026-06-05')).toBe('Updated 2026-06-05');
    expect(
      formatSurveyMetadata({
        surveyDate: '2026-06-05',
        dataSource: 'FIELD_SURVEY',
        location: 'Chorsu Bazaar and Korzinka, Tashkent',
      }),
    ).toEqual(['Updated 2026-06-05', 'Based on field survey data', 'Chorsu Bazaar and Korzinka, Tashkent']);
  });

  it('formats source summary with a clean middle dot separator', () => {
    const summary = formatSourceSummary({ sampleCount: 1, confidenceScore: 0.58 });

    expect(summary).toBe('Limited data · Moderate confidence (58%)');
    expect(summary).not.toContain('쨌');
    expect(summary).not.toContain('횂');
  });

  it('formats product subtitles and market labels for consumer screens', () => {
    expect(formatProductSubtitle({ nameUz: 'Pomidor', nameRu: 'Помидор', nameKo: '토마토' })).toBe(
      'Pomidor · Помидор · 토마토',
    );
    expect(
      formatMarketLocation({
        code: 'TASHKENT_CHORSU',
        city: 'Tashkent',
        district: 'Shaykhontohur',
        address: null,
      }),
    ).toBe('Old City, Tashkent');
    expect(formatMarketTypeLabel({ marketType: 'ONLINE_RETAIL' })).toBe('Reference data');
  });

  it('formats product match output without raw variant syntax', () => {
    const match: ProductNormalizeResponse = {
      rawProductName: 'pink greenhouse pomidor',
      standardProductCode: 'TOMATO',
      standardProductName: 'Tomato',
      variant: 'PINK_GREENHOUSE',
      matchConfidence: 0.92,
      needsHumanReview: false,
      matchedAliases: ['pomidor'],
      explanation: 'Matched by alias.',
    };

    expect(formatVariantLabel('PINK_GREENHOUSE')).toBe('Pink Greenhouse');
    expect(formatProductMatchTitle(match)).toBe('Matched to Tomato · Pink Greenhouse');
    expect(formatProductMatchConfidence(match.matchConfidence)).toBe('Confidence: High');
  });

  it('formats price check metrics for display', () => {
    expect(
      getPriceCheckDisplayMetrics({
        productCode: 'RICE',
        marketCode: 'TASHKENT_CHORSU',
        quotedPrice: 18000,
        unitCode: 'KG',
        fairLow: 14200,
        fairMid: 15000,
        fairHigh: 15800,
        verdict: 'EXPENSIVE',
        verdictMessage: 'Higher than usual',
        recommendedTargetPrice: 15800,
        overFairHighPercent: 13.92,
        confidenceScore: 0.58,
        sampleCount: 1,
        sourceBreakdown: { FIELD_SURVEY: 1 },
      }),
    ).toEqual([
      { label: 'Target reference', value: '15,800 UZS' },
      { label: 'Above fair range', value: '13.92%' },
    ]);
  });
});

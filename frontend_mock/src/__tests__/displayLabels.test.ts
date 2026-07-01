import { describe, expect, it } from '@jest/globals';

import type { PriceCheckResponse, ProductResponse } from '@/src/api/apiTypes';
import type { ProductNormalizeResponse, ReportInspectResponse } from '@/src/api/agentTypes';
import {
  DISPLAY_SEPARATOR,
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
  getPriceCheckResultDisplay,
  getReportInspectionDisplay,
} from '@/src/utils/displayLabels';
import {
  OTHER_PRODUCT_VALUE,
  PRICE_CHECK_PRODUCT_CODES,
  PRICE_CHECK_UNIT_CODES,
  REPORT_PRODUCT_CODES,
  REPORT_UNIT_CODES,
  buildMarketChoices,
  buildProductChoices,
  buildUnitChoices,
} from '@/src/utils/consumerFormOptions';

const baseCheck: PriceCheckResponse = {
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
};

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

    expect(DISPLAY_SEPARATOR).toBe(' · ');
    expect(summary).toBe('Limited data · Moderate confidence (58%)');
    expect(summary).not.toContain('fairLow');
    expect(summary).not.toContain('FIELD_SURVEY');
  });

  it('formats product subtitles and market labels for consumer screens', () => {
    expect(formatProductSubtitle({ nameUz: 'Pomidor', nameRu: 'Pomidor RU', nameKo: 'Tomato KO' })).toBe(
      'Pomidor · Pomidor RU · Tomato KO',
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
    expect(getPriceCheckDisplayMetrics(baseCheck)).toEqual([
      { label: 'Target reference', value: '15,800 UZS' },
      { label: 'Above fair range', value: '13.92%' },
    ]);
  });

  it('maps price check verdicts to Step 3 display variants', () => {
    expect(getPriceCheckResultDisplay({ ...baseCheck, verdict: 'FAIR' })).toMatchObject({
      title: 'Within the fair range',
      tone: 'success',
    });
    expect(getPriceCheckResultDisplay({ ...baseCheck, verdict: 'EXPENSIVE' })).toMatchObject({
      title: 'Higher than usual',
      tone: 'warning',
    });
    expect(getPriceCheckResultDisplay({ ...baseCheck, verdict: 'VERY_EXPENSIVE' })).toMatchObject({
      title: 'Significantly above range',
      tone: 'danger',
    });
    expect(getPriceCheckResultDisplay({ ...baseCheck, confidenceScore: 0.2, sourceBreakdown: {} })).toMatchObject({
      title: 'Use as reference',
      limitedData: true,
      tone: 'neutral',
    });
  });

  it('maps report inspection responses to Step 3 display variants', () => {
    expect(getReportInspectionDisplay(reportInspection('LOW', 'PENDING'))).toMatchObject({
      title: 'Report Check · Looks normal',
      tone: 'success',
    });
    expect(getReportInspectionDisplay(reportInspection('MEDIUM', 'REVIEW_REQUIRED'))).toMatchObject({
      title: 'Report Check · Needs review',
      tone: 'warning',
    });
    expect(getReportInspectionDisplay(reportInspection('HIGH', 'FLAGGED'))).toMatchObject({
      title: 'Report Check · Needs review',
      tone: 'danger',
    });
  });

  it('builds Step 3 product, market, and unit choices', () => {
    const products: ProductResponse[] = [
      product('TOMATO', 'Tomato', 'KG'),
      product('RICE', 'Rice', 'KG'),
      product('EGGS', 'Eggs', 'PCS_10'),
      product('VEGETABLE_OIL', 'Vegetable Oil', 'LITER'),
      product('BEEF', 'Beef', 'KG'),
      product('CARROT', 'Carrot', 'KG'),
      product('ONION', 'Onion', 'KG'),
    ];

    expect(buildProductChoices(products, PRICE_CHECK_PRODUCT_CODES).map((choice) => choice.label)).toEqual([
      'Tomato',
      'Rice',
      'Eggs',
      'Vegetable Oil',
      'Beef',
      'Other',
    ]);
    expect(buildProductChoices(products, REPORT_PRODUCT_CODES).at(-1)).toMatchObject({
      value: OTHER_PRODUCT_VALUE,
      label: 'Other',
    });
    expect(
      buildMarketChoices([
        market('TASHKENT_CHORSU', 'Chorsu Bazaar'),
        market('KORZINKA_ONLINE', 'Korzinka online'),
      ]).map((choice) => choice.label),
    ).toEqual(['Chorsu Bazaar', 'Korzinka']);
    expect(buildUnitChoices(PRICE_CHECK_UNIT_CODES, 'PCS_10')).toEqual(['PCS_10', 'KG', 'LITER', 'BUNDLE']);
    expect(buildUnitChoices(REPORT_UNIT_CODES, 'KG')).toEqual(['KG', 'PCS_10', 'LITER', 'BUNDLE', 'PCS']);
  });

  it('does not emit raw backend field labels in Step 3 display helpers', () => {
    const outputs = [
      getPriceCheckResultDisplay(baseCheck).title,
      getPriceCheckResultDisplay(baseCheck).recommendation,
      getReportInspectionDisplay(reportInspection('MEDIUM', 'REVIEW_REQUIRED')).title,
      getReportInspectionDisplay(reportInspection('MEDIUM', 'REVIEW_REQUIRED')).message,
      formatSourceSummary({ sampleCount: 1, confidenceScore: 0.58, dataSource: 'FIELD_SURVEY' }),
    ].join(' ');

    ['fairLow', 'fairMid', 'fairHigh', 'sampleCount', 'FIELD_SURVEY'].forEach((forbidden) => {
      expect(outputs).not.toContain(forbidden);
    });
  });
});

function product(code: string, nameEn: string, defaultUnit: string): ProductResponse {
  return {
    id: code,
    code,
    nameKo: `${nameEn} KO`,
    nameEn,
    nameUz: `${nameEn} UZ`,
    nameRu: `${nameEn} RU`,
    defaultUnit,
    seasonal: false,
    active: true,
    aliases: [],
  };
}

function market(code: string, name: string) {
  return {
    id: code,
    code,
    name,
    city: 'Tashkent',
    district: null,
    address: null,
    latitude: null,
    longitude: null,
    marketType: code === 'KORZINKA_ONLINE' ? ('ONLINE_RETAIL' as const) : ('BAZAAR' as const),
    active: true,
  };
}

function reportInspection(
  riskLevel: ReportInspectResponse['riskLevel'],
  statusSuggestion: ReportInspectResponse['statusSuggestion'],
): ReportInspectResponse {
  return {
    normalizedProductCode: 'RICE',
    riskLevel,
    statusSuggestion,
    needsHumanReview: statusSuggestion !== 'PENDING',
    anomalyReasons: [],
    reviewNote: 'Reports stay under review.',
    userMessage: 'Thanks for the report.',
    sourceSummary: {
      sampleCount: 1,
      confidenceScore: 0.58,
      sourceBreakdown: { FIELD_SURVEY: 1 },
    },
    safetyFlags: {
      noAutoApproval: true,
      noAiGeneratedFairPrice: true,
    },
  };
}

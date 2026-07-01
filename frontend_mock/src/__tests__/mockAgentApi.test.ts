import { describe, expect, it } from '@jest/globals';

import {
  getMockFieldSurveyPlan,
  getMockMarketBriefing,
  getMockPriceInsight,
  inspectMockReport,
  normalizeMockProduct,
} from '@/src/api/mockAgentApi';

describe('mock agent API', () => {
  it('normalizes pink greenhouse pomidor to TOMATO', async () => {
    const result = await normalizeMockProduct({ rawProductName: 'pink greenhouse pomidor' });

    expect(result.standardProductCode).toBe('TOMATO');
    expect(result.variant).toBe('PINK_GREENHOUSE');
    expect(result.needsHumanReview).toBe(false);
  });

  it('marks unknown local vegetable for human review', async () => {
    const result = await normalizeMockProduct({ rawProductName: 'unknown local vegetable' });

    expect(result.standardProductCode).toBeNull();
    expect(result.needsHumanReview).toBe(true);
  });

  it('inspects RICE 18000 as at least review required', async () => {
    const result = await inspectMockReport({
      productCode: 'RICE',
      marketCode: 'TASHKENT_CHORSU',
      submittedPrice: 18000,
      submittedUnit: 'KG',
    });

    expect(['REVIEW_REQUIRED', 'FLAGGED']).toContain(result.statusSuggestion);
    expect(['MEDIUM', 'HIGH']).toContain(result.riskLevel);
  });

  it('returns EXPENSIVE backend verdict for RICE 18000 price insight', async () => {
    const result = await getMockPriceInsight({
      productCode: 'RICE',
      marketCode: 'TASHKENT_CHORSU',
      quotedPrice: 18000,
      unitCode: 'KG',
    });

    expect(result.backendVerdict).toBe('EXPENSIVE');
    expect(result.safetyFlags.noAiGeneratedFairPrice).toBe(true);
  });

  it('returns a market briefing title', async () => {
    const result = await getMockMarketBriefing({
      marketCode: 'TASHKENT_CHORSU',
      summaryDate: '2026-06-05',
    });

    expect(result.briefingTitle).toBeTruthy();
  });

  it('returns a string field survey recommendedPlan', async () => {
    const result = await getMockFieldSurveyPlan({
      marketCode: 'TASHKENT_CHORSU',
      summaryDate: '2026-06-05',
    });

    expect(typeof result.recommendedPlan).toBe('string');
    expect(result.recommendedPlan.length).toBeGreaterThan(0);
  });
});

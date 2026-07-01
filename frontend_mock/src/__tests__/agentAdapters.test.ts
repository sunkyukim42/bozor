import { describe, expect, it } from '@jest/globals';

import {
  adaptFieldSurveyPlan,
  adaptMarketBriefing,
  adaptPriceInsight,
  adaptReportInspect,
} from '@/src/api/adapters/agentAdapter';

describe('agent adapters', () => {
  it('maps backend price insight verdict to backendVerdict', () => {
    const insight = adaptPriceInsight({
      productCode: 'RICE',
      marketCode: 'TASHKENT_CHORSU',
      quotedPrice: 18000,
      unitCode: 'KG',
      verdict: 'EXPENSIVE',
      fairLow: 14300,
      fairMid: 15000,
      fairHigh: 15800,
      sourceSummary: {
        productCode: 'RICE',
        marketCode: 'TASHKENT_CHORSU',
        summaryDate: '2026-06-05',
        sampleCount: 1,
        confidenceScore: 0.58,
        sourceBreakdown: '{"FIELD_SURVEY":1}',
      },
      recommendedAction: {
        productCode: 'RICE',
        priority: 'MEDIUM',
        message: 'Compare another stall or market before buying.',
      },
      safetyFlags: {
        noAiGeneratedFairPrice: true,
        difyConnected: false,
      },
    });

    expect(insight.backendVerdict).toBe('EXPENSIVE');
    expect(insight.sourceSummary).toContain('RICE at TASHKENT_CHORSU');
    expect(insight.recommendedAction).toContain('Compare another stall');
    expect(insight.safetyFlags.noAiGeneratedFairPrice).toBe(true);
    expect(insight.safetyFlags.difyConnected).toBe(false);
  });

  it('normalizes field survey plans with string recommendedPlan fallback and arrays', () => {
    const plan = adaptFieldSurveyPlan({
      marketCode: 'TASHKENT_CHORSU',
      summaryDate: '2026-06-05',
      todaySurveyTargets: [{ productCode: 'RICE', priority: 'HIGH', reason: 'Low sample count.' }],
      surveyTargets: [{ productCode: 'EGGS', priority: 'MEDIUM', reason: 'Low confidence.' }],
      recommendedActions: [{ productCode: 'RICE', priority: 'HIGH', message: 'Prioritize RICE.' }],
    });

    expect(plan.recommendedPlan).toBeTruthy();
    expect(plan.todaySurveyTargets).toEqual([
      expect.objectContaining({ productCode: 'RICE', priority: 'HIGH' }),
    ]);
    expect(plan.surveyTargets).toEqual([
      expect.objectContaining({ productCode: 'EGGS', priority: 'MEDIUM' }),
    ]);
    expect(plan.recommendedActions).toEqual([
      expect.objectContaining({ label: 'RICE (HIGH)', description: 'Prioritize RICE.' }),
    ]);
  });

  it('normalizes market briefing string highlights and missing optional fields', () => {
    const briefing = adaptMarketBriefing({
      briefingTitle: 'Chorsu briefing',
      summaryText: 'Stored backend data only.',
      highlights: ['RICE fair midpoint is 15000.'],
      recommendedActions: ['Collect more samples.'],
    });

    expect(briefing.highlights).toEqual([{ message: 'RICE fair midpoint is 15000.' }]);
    expect(briefing.recommendedActions).toEqual([{ description: 'Collect more samples.' }]);
    expect(briefing.dataWarnings).toEqual([]);
  });

  it('keeps report inspect defensive when optional payload is missing', () => {
    const inspection = adaptReportInspect({});

    expect(inspection.riskLevel).toBe('LOW');
    expect(inspection.statusSuggestion).toBe('PENDING');
    expect(inspection.anomalyReasons).toEqual([]);
    expect(inspection.safetyFlags?.noAutoApproval).toBe(true);
  });
});

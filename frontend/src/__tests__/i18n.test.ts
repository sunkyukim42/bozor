import { describe, expect, it } from '@jest/globals';

import { dictionaries, translate } from '@/src/i18n/dictionaries';
import type { Locale } from '@/src/i18n/types';

const locales: Locale[] = ['ko', 'en', 'uz', 'ru'];
const verdictMessageKeys = [
  'verdict.cheap.message',
  'verdict.fair.message',
  'verdict.expensive.message',
  'verdict.veryExpensive.message',
];
const agentKeys = [
  'agent.marketBriefing.title',
  'agent.priceInsight.title',
  'agent.reportInspect.title',
  'agent.productNormalize.title',
  'agent.fieldSurveyPlan.title',
  'agent.mockNotice',
  'agent.difyNotConnected',
  'agent.noAutoApproval',
  'agent.needsHumanReview',
  'agent.risk.low',
  'agent.risk.medium',
  'agent.risk.high',
  'agent.priority.high',
  'agent.priority.medium',
  'agent.priority.low',
];

describe('i18n dictionaries', () => {
  it('contains verdict messages for all supported locales', () => {
    for (const locale of locales) {
      for (const key of verdictMessageKeys) {
        expect(dictionaries[locale][key]).toBeTruthy();
      }
    }
  });

  it('contains agent labels for all supported locales', () => {
    for (const locale of locales) {
      for (const key of agentKeys) {
        expect(dictionaries[locale][key]).toBeTruthy();
      }
    }
  });

  it('falls back to English and then the key', () => {
    expect(translate('uz', 'apiStatus')).toBe(dictionaries.en.apiStatus);
    expect(translate('ru', 'missing.translation.key')).toBe('missing.translation.key');
  });
});

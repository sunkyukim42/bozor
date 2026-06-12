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

describe('i18n dictionaries', () => {
  it('contains verdict messages for all supported locales', () => {
    for (const locale of locales) {
      for (const key of verdictMessageKeys) {
        expect(dictionaries[locale][key]).toBeTruthy();
      }
    }
  });

  it('falls back to English and then the key', () => {
    expect(translate('uz', 'apiStatus')).toBe(dictionaries.en.apiStatus);
    expect(translate('ru', 'missing.translation.key')).toBe('missing.translation.key');
  });
});

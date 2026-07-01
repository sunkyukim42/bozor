import { useCallback } from 'react';

import { translate } from '@/src/i18n/dictionaries';
import type { Locale } from '@/src/i18n/types';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';

export function useI18n() {
  const locale = useAppSettingsStore((state) => state.locale);
  const setLocale = useAppSettingsStore((state) => state.setLocale);
  const t = useCallback((key: string) => translate(locale, key), [locale]);
  return { locale, setLocale: setLocale as (locale: Locale) => void, t };
}

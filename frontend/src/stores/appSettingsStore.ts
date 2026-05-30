import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_MARKET_CODE } from '@/src/api/mockData';
import type { Locale } from '@/src/i18n/types';

const supportedLocales: Locale[] = ['ko', 'en', 'uz', 'ru'];

type AppSettingsState = {
  locale: Locale;
  selectedMarketCode: string;
  setLocale: (locale: Locale) => void;
  setSelectedMarketCode: (marketCode: string) => void;
};

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      selectedMarketCode: DEFAULT_MARKET_CODE,
      setLocale: (locale) => set({ locale }),
      setSelectedMarketCode: (selectedMarketCode) => set({ selectedMarketCode }),
    }),
    {
      name: 'bozorcheck-app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

function detectLocale(): Locale {
  const languageCode = getLocales()[0]?.languageCode;
  return supportedLocales.includes(languageCode as Locale) ? (languageCode as Locale) : 'ko';
}

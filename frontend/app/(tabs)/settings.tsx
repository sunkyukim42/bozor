import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { Locale } from '@/src/i18n/types';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppSelect } from '@/src/components/common/AppSelect';
import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { MarketSelector } from '@/src/components/market/MarketSelector';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useSelectedMarket, useSetSelectedMarket } from '@/src/hooks/useMarketPreference';
import { routes } from '@/src/navigation/routes';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

const locales: Locale[] = ['ko', 'en', 'uz', 'ru'];

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const markets = useMarkets();
  const marketCode = useSelectedMarket();
  const setMarketCode = useSetSelectedMarket();
  const clearRecentSearches = useRecentSearchStore((state) => state.clearRecentSearches);

  if (markets.isLoading) {
    return <LoadingState />;
  }
  if (markets.error || !markets.data) {
    return <ErrorState message="We could not load settings. Please try again." />;
  }

  return (
    <Screen>
      <AppText variant="title">{t('settings')}</AppText>
      <AppCard>
        <AppText variant="sectionTitle">{t('appName')}</AppText>
        <AppText muted>Fair bazaar price transparency for Uzbekistan.</AppText>
      </AppCard>
      <AppCard>
        <AppSelect
          label={t('language')}
          onSelect={(value) => setLocale(value as Locale)}
          options={locales.map((value) => ({ label: value.toUpperCase(), value }))}
          selectedValue={locale}
        />
      </AppCard>
      <AppCard>
        <MarketSelector
          label={t('defaultMarket')}
          markets={markets.data}
          onSelect={setMarketCode}
          selectedValue={marketCode}
        />
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">Price alerts</AppText>
        <AppText muted>Alerts are planned for a later phase.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">Privacy</AppText>
        <AppText muted>Camera, location, and upload permissions are not requested in this step.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">How prices are collected</AppText>
        <AppText muted>Prices are based on field survey data, reference data, and reports that stay under review.</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">Developer Tools</AppText>
        <View>
          <AppButton onPress={() => router.push(routes.apiStatus)} title={t('apiStatus')} />
        </View>
        <View>
          <AppButton onPress={() => router.push(routes.agentLab)} title="Dev Agent Lab" variant="secondary" />
        </View>
      </AppCard>
      <AppButton onPress={clearRecentSearches} title={t('clearRecentSearches')} variant="secondary" />
    </Screen>
  );
}

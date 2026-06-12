import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { API_BASE_URL, USE_MOCK_API } from '@/src/api/apiClient';
import type { Locale } from '@/src/i18n/types';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppSelect } from '@/src/components/common/AppSelect';
import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { MarketSelector } from '@/src/components/market/MarketSelector';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { routes } from '@/src/navigation/routes';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

const locales: Locale[] = ['ko', 'en', 'uz', 'ru'];

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const markets = useMarkets();
  const selectedMarketCode = useAppSettingsStore((state) => state.selectedMarketCode);
  const setSelectedMarketCode = useAppSettingsStore((state) => state.setSelectedMarketCode);
  const clearRecentSearches = useRecentSearchStore((state) => state.clearRecentSearches);

  if (markets.isLoading) {
    return <LoadingState />;
  }
  if (markets.error || !markets.data) {
    return <ErrorState message="설정을 불러오지 못했습니다." />;
  }

  return (
    <Screen>
      <AppText variant="title">{t('settings')}</AppText>
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
          onSelect={setSelectedMarketCode}
          selectedMarketCode={selectedMarketCode}
        />
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">{t('apiStatus')}</AppText>
        <View style={styles.statusRows}>
          <StatusRow label="Mock API" value={String(USE_MOCK_API)} />
          <StatusRow label={t('apiBaseUrl')} value={API_BASE_URL} />
        </View>
      </AppCard>
      <AppButton onPress={clearRecentSearches} title={t('clearRecentSearches')} variant="secondary" />
      <AppButton onPress={() => router.push(routes.apiStatus)} title={t('apiStatus')} />
      <AppButton onPress={() => router.push(routes.agentLab)} title="Dev Agent Lab" variant="secondary" />
    </Screen>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <AppText muted>{label}</AppText>
      <AppText style={styles.statusValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statusRows: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusValue: {
    flex: 1,
    fontWeight: '800',
    textAlign: 'right',
  },
});

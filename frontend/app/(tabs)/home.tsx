import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MOCK_DATA_NOTICE, findMockSummary } from '@/src/api/mockData';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useProducts } from '@/src/hooks/useProducts';
import { routes } from '@/src/navigation/routes';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const selectedMarketCode = useAppSettingsStore((state) => state.selectedMarketCode);
  const recentSearches = useRecentSearchStore((state) => state.recentSearches);
  const products = useProducts();
  const markets = useMarkets();

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  const selectedMarket = markets.data.find((market) => market.code === selectedMarketCode);
  const topProducts = products.data.slice(0, 5);
  const trusted = topProducts.filter((product) => findMockSummary(product.code, selectedMarketCode).confidenceScore >= 0.8);
  const lowData = topProducts.filter((product) => findMockSummary(product.code, selectedMarketCode).confidenceScore < 0.8);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">{t('appName')}</AppText>
          <AppText muted>Fair Bazaar Companion</AppText>
        </View>
        <View style={styles.mockBadge}>
          <AppText variant="caption" style={styles.mockText}>
            {t('mockApi')}
          </AppText>
        </View>
      </View>

      <AppCard>
        <AppText variant="caption" muted>
          {t('currentMarket')}
        </AppText>
        <AppText variant="sectionTitle">{selectedMarket?.name ?? selectedMarketCode}</AppText>
        <AppText variant="caption" muted>
          selectedMarketCode: {selectedMarketCode}
        </AppText>
      </AppCard>

      <View style={styles.ctaStack}>
        <AppButton onPress={() => router.push(routes.check)} title={t('checkPrice')} />
        <AppButton onPress={() => router.push(routes.report)} title={t('reportPrice')} variant="secondary" />
      </View>

      <AppText variant="sectionTitle">{t('todayPrices')}</AppText>
      {topProducts.map((product) => (
        <ProductPriceSummaryCard key={product.code} compact summary={findMockSummary(product.code, selectedMarketCode)} />
      ))}

      <AppCard>
        <AppText variant="sectionTitle">{t('confidenceSummary')}</AppText>
        <View style={styles.confidenceRow}>
          <View style={styles.confidenceColumn}>
            <AppText variant="caption" muted>
              신뢰도 높은 품목
            </AppText>
            <AppText>{trusted.map((product) => product.nameEn).join(', ') || 'None'}</AppText>
          </View>
          <View style={styles.confidenceColumn}>
            <AppText variant="caption" muted>
              데이터 보강 필요
            </AppText>
            <AppText>{lowData.map((product) => product.nameEn).join(', ') || 'None'}</AppText>
          </View>
        </View>
        <ConfidenceBadge score={findMockSummary('TOMATO', selectedMarketCode).confidenceScore} />
      </AppCard>

      <AppCard>
        <AppText variant="sectionTitle">{t('recentSearches')}</AppText>
        <AppText muted>{recentSearches.length > 0 ? recentSearches.join(', ') : 'No recent searches'}</AppText>
      </AppCard>

      <AppText variant="caption" muted>
        {MOCK_DATA_NOTICE}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  confidenceColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  confidenceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  ctaStack: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  mockBadge: {
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mockText: {
    color: colors.primary,
    fontWeight: '800',
  },
});

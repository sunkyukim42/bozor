import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { USE_MOCK_API } from '@/src/api/apiClient';
import type { ProductResponse } from '@/src/api/apiTypes';
import { MOCK_DATA_NOTICE } from '@/src/api/mockData';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
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

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">{t('appName')}</AppText>
          <AppText muted>Fair Bazaar Companion</AppText>
        </View>
        <View style={styles.mockBadge}>
          <AppText variant="caption" style={styles.mockText}>
            {USE_MOCK_API ? t('mockApi') : 'Real API'}
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
        <HomeProductSummary key={product.code} marketCode={selectedMarketCode} product={product} />
      ))}

      <AppCard>
        <AppText variant="sectionTitle">{t('confidenceSummary')}</AppText>
        <AppText muted>
          {USE_MOCK_API
            ? 'Mock summaries show representative confidence badges.'
            : 'Each product card shows its latest API confidence score when available.'}
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="sectionTitle">{t('recentSearches')}</AppText>
        <AppText muted>{recentSearches.length > 0 ? recentSearches.join(', ') : 'No recent searches'}</AppText>
      </AppCard>

      {USE_MOCK_API ? (
        <AppText variant="caption" muted>
          {MOCK_DATA_NOTICE}
        </AppText>
      ) : null}
    </Screen>
  );
}

function HomeProductSummary({ marketCode, product }: { marketCode: string; product: ProductResponse }) {
  const { t } = useI18n();
  const summary = usePriceSummary(product.code, marketCode);
  if (summary.isLoading) {
    return (
      <AppCard>
        <AppText variant="sectionTitle">{product.nameEn}</AppText>
        <LoadingState />
      </AppCard>
    );
  }
  if (summary.error || !summary.data) {
    return (
      <AppCard>
        <AppText variant="sectionTitle">{product.nameEn}</AppText>
        <EmptyState message={t('lowData')} />
      </AppCard>
    );
  }
  return (
    <View>
      <AppText variant="caption" muted>
        {product.code}
      </AppText>
      <ProductPriceSummaryCard compact summary={summary.data} />
    </View>
  );
}

const styles = StyleSheet.create({
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

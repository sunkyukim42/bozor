import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { ProductResponse } from '@/src/api/apiTypes';
import { SURVEY_DATE } from '@/src/api/mockData';
import { MarketBriefingCard } from '@/src/components/agent/MarketBriefingCard';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppHeader } from '@/src/components/common/AppHeader';
import { AppText } from '@/src/components/common/AppText';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarketBriefing } from '@/src/hooks/useMarketBriefing';
import { useMarkets } from '@/src/hooks/useMarkets';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
import { useProducts } from '@/src/hooks/useProducts';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { routes } from '@/src/navigation/routes';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

export default function HomeScreen() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const marketCode = useSelectedMarket();
  const recentSearches = useRecentSearchStore((state) => state.recentSearches);
  const products = useProducts();
  const markets = useMarkets();
  const marketBriefing = useMarketBriefing(marketCode, SURVEY_DATE, locale);

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  const selectedMarket = markets.data.find((market) => market.code === marketCode);
  const topProducts = products.data.slice(0, 5);

  return (
    <Screen>
      <AppHeader title={t('appName')} subtitle="Fair Bazaar Companion" />

      <AppCard>
        <AppText variant="caption" muted>
          {t('currentMarket')}
        </AppText>
        <AppText variant="sectionTitle">{selectedMarket?.name ?? 'Selected market'}</AppText>
      </AppCard>

      {marketBriefing.data ? (
        <MarketBriefingCard briefing={marketBriefing.data} />
      ) : marketBriefing.isLoading ? (
        <AppCard>
          <AppText variant="sectionTitle">{t('agent.marketBriefing.title')}</AppText>
          <LoadingState compact />
        </AppCard>
      ) : marketBriefing.error ? (
        <AppCard>
          <AppText variant="sectionTitle">{t('agent.marketBriefing.title')}</AppText>
          <AppText muted>Agent briefing is unavailable for this market right now.</AppText>
        </AppCard>
      ) : null}

      <View style={styles.ctaStack}>
        <AppButton onPress={() => router.push(routes.check)} title={t('checkPrice')} />
        <AppButton onPress={() => router.push(routes.report)} title={t('reportPrice')} variant="secondary" />
      </View>

      <AppText variant="sectionTitle">{t('todayPrices')}</AppText>
      {topProducts.map((product) => (
        <HomeProductSummary key={product.code} marketCode={marketCode} product={product} />
      ))}

      <AppCard>
        <AppText variant="sectionTitle">{t('confidenceSummary')}</AppText>
        <AppText muted>Each product card shows data confidence when available.</AppText>
      </AppCard>

      <AppCard>
        <AppText variant="sectionTitle">{t('recentSearches')}</AppText>
        <AppText muted>{recentSearches.length > 0 ? recentSearches.join(', ') : 'No recent searches'}</AppText>
      </AppCard>
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
        <LoadingState compact />
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
        {product.nameEn}
      </AppText>
      <ProductPriceSummaryCard compact summary={summary.data} />
    </View>
  );
}

const styles = StyleSheet.create({
  ctaStack: {
    gap: spacing.md,
  },
});

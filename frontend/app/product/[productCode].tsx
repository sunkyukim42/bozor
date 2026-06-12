import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { BackHeader } from '@/src/components/common/BackHeader';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { PriceHistoryChart } from '@/src/components/product/PriceHistoryChart';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { spacing } from '@/src/constants/spacing';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { usePriceHistory } from '@/src/hooks/usePriceHistory';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
import { useProduct } from '@/src/hooks/useProducts';

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productCode: string }>();
  const productCode = params.productCode;
  const marketCode = useSelectedMarket();
  const product = useProduct(productCode);
  const summary = usePriceSummary(productCode, marketCode);
  const history = usePriceHistory(productCode, marketCode);

  if (product.isLoading) {
    return <LoadingState />;
  }
  if (product.error || !product.data) {
    return <ErrorState message="We could not load this product. Please try again." />;
  }

  return (
    <Screen>
      <BackHeader
        title={product.data.nameEn}
        subtitle={`${product.data.nameUz} · ${product.data.nameRu} · ${product.data.nameKo}`}
      />

      {summary.isLoading ? <LoadingState /> : null}
      {summary.error || !summary.data ? (
        <EmptyState message="There is not enough market data for this product yet. Use it as reference only." />
      ) : (
        <ProductPriceSummaryCard summary={summary.data} />
      )}
      <AppCard>
        <AppText variant="sectionTitle">7-day trend</AppText>
        {history.isLoading ? <LoadingState compact /> : null}
        {history.error || !history.data || history.data.summaries.length === 0 ? (
          <EmptyState message="There is not enough recent trend data yet." />
        ) : (
          <PriceHistoryChart items={history.data.summaries} />
        )}
      </AppCard>

      <View style={styles.ctaStack}>
        <AppButton onPress={() => router.push({ pathname: '/check', params: { productCode } })} title="Check this price" />
        <AppButton
          onPress={() => router.push({ pathname: '/report', params: { productCode } })}
          title="Report price"
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ctaStack: {
    gap: spacing.md,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { PriceSummaryResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { BackHeader } from '@/src/components/common/BackHeader';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { SourceBreakdown } from '@/src/components/common/SourceBreakdown';
import { PriceHistoryChart } from '@/src/components/product/PriceHistoryChart';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { usePriceHistory } from '@/src/hooks/usePriceHistory';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
import { useProduct } from '@/src/hooks/useProducts';
import { formatDataContext, formatProductSubtitle, formatSurveyMetadata } from '@/src/utils/displayLabels';

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productCode: string }>();
  const productCode = params.productCode;
  const marketCode = useSelectedMarket();
  const product = useProduct(productCode);
  const summary = usePriceSummary(productCode, marketCode);
  const history = usePriceHistory(productCode, marketCode);

  if (product.isLoading) {
    return <LoadingState label="Loading product..." />;
  }
  if (product.error || !product.data) {
    return <ErrorState message="We could not load this product. Please try again." />;
  }

  return (
    <Screen>
      <BackHeader title={product.data.nameEn} subtitle={formatProductSubtitle(product.data)} />

      {summary.isLoading ? (
        <AppCard>
          <LoadingState compact label="Loading price data..." />
        </AppCard>
      ) : summary.error || !summary.data ? (
        <EmptyState message="There is not enough market data for this product yet. Use it as reference only." />
      ) : (
        <>
          <ProductPriceSummaryCard product={product.data} showDetails={false} showProductHeader={false} summary={summary.data} />
          <DataSourceCard summary={summary.data} />
        </>
      )}

      <AppCard>
        {history.isLoading ? <LoadingState compact label="Loading price trend..." /> : null}
        {history.error || !history.data || history.data.summaries.length === 0 ? (
          <EmptyState message="There is not enough recent trend data yet." title="No recent trend" />
        ) : (
          <PriceHistoryChart items={history.data.summaries} title="7-day price trend" />
        )}
        <AppText variant="caption" muted>
          Historical market summaries only. This is not a forecast.
        </AppText>
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

function DataSourceCard({ summary }: { summary: PriceSummaryResponse }) {
  const metadata = formatSurveyMetadata(summary);

  return (
    <AppCard>
      <View style={styles.sourceHeader}>
        <View>
          <AppText variant="sectionTitle">Data source</AppText>
          <AppText variant="caption" muted>
            {formatDataContext(summary)}
          </AppText>
        </View>
        <View style={styles.referencePill}>
          <AppText variant="caption" style={styles.referenceText}>
            Use as reference
          </AppText>
        </View>
      </View>
      <View style={styles.metadata}>
        {metadata.map((item) => (
          <AppText key={item} variant="caption" muted>
            {item}
          </AppText>
        ))}
      </View>
      <SourceBreakdown sources={summary.sourceBreakdown} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  ctaStack: {
    gap: spacing.md,
  },
  metadata: {
    gap: spacing.xs,
  },
  referencePill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  referenceText: {
    color: colors.primary,
    fontWeight: '700',
  },
  sourceHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { PriceHistoryChart } from '@/src/components/product/PriceHistoryChart';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { spacing } from '@/src/constants/spacing';
import { usePriceHistory } from '@/src/hooks/usePriceHistory';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
import { useProduct } from '@/src/hooks/useProducts';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productCode: string }>();
  const productCode = params.productCode;
  const selectedMarketCode = useAppSettingsStore((state) => state.selectedMarketCode);
  const product = useProduct(productCode);
  const summary = usePriceSummary(productCode, selectedMarketCode);
  const history = usePriceHistory(productCode, selectedMarketCode);

  if (product.isLoading) {
    return <LoadingState />;
  }
  if (product.error || !product.data) {
    return <ErrorState message="상품 정보를 불러오지 못했습니다." />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">{product.data.nameEn}</AppText>
        <AppText muted>
          {product.data.nameUz} · {product.data.nameRu} · {product.data.nameKo}
        </AppText>
      </View>

      {summary.isLoading ? <LoadingState /> : null}
      {summary.error || !summary.data ? (
        <EmptyState message="아직 이 시장의 데이터가 충분하지 않습니다. 참고용으로 확인해 주세요." />
      ) : (
        <ProductPriceSummaryCard summary={summary.data} />
      )}
      <AppCard>
        {history.isLoading ? <LoadingState /> : null}
        {history.error || !history.data || history.data.summaries.length === 0 ? (
          <EmptyState message="아직 표시할 가격 흐름 데이터가 충분하지 않습니다." />
        ) : (
          <PriceHistoryChart items={history.data.summaries} />
        )}
      </AppCard>

      <View style={styles.ctaStack}>
        <AppButton
          onPress={() => router.push({ pathname: '/check', params: { productCode } })}
          title="이 가격 괜찮나요?"
        />
        <AppButton
          onPress={() => router.push({ pathname: '/report', params: { productCode } })}
          title="가격 제보하기"
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
  header: {
    gap: spacing.xs,
  },
});

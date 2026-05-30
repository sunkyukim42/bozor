import { useLocalSearchParams } from 'expo-router';

import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { PriceCheckForm } from '@/src/components/price/PriceCheckForm';
import { PriceCheckResultCard } from '@/src/components/price/PriceCheckResultCard';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { usePriceCheck } from '@/src/hooks/usePriceCheck';
import { useProducts } from '@/src/hooks/useProducts';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';

export default function CheckScreen() {
  const params = useLocalSearchParams<{ productCode?: string }>();
  const { t } = useI18n();
  const selectedMarketCode = useAppSettingsStore((state) => state.selectedMarketCode);
  const products = useProducts();
  const markets = useMarkets();
  const checkMutation = usePriceCheck();

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  return (
    <Screen>
      <AppText variant="title">{t('checkPrice')}</AppText>
      <AppText muted>데이터 기반 가격 판정입니다. AI 문장 생성은 이번 단계에 포함하지 않습니다.</AppText>
      <PriceCheckForm
        key={params.productCode ?? 'manual-check'}
        defaultMarketCode={selectedMarketCode}
        defaultProductCode={params.productCode}
        loading={checkMutation.isPending}
        markets={markets.data}
        products={products.data}
        onSubmit={(request) => checkMutation.mutate(request)}
      />
      {checkMutation.data ? <PriceCheckResultCard result={checkMutation.data} /> : null}
    </Screen>
  );
}

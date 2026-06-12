import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import { AgentInsightCard } from '@/src/components/agent/AgentInsightCard';
import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { PriceCheckForm } from '@/src/components/price/PriceCheckForm';
import { PriceCheckResultCard } from '@/src/components/price/PriceCheckResultCard';
import { useI18n } from '@/src/hooks/useI18n';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { useMarkets } from '@/src/hooks/useMarkets';
import { usePriceCheck } from '@/src/hooks/usePriceCheck';
import { usePriceInsight } from '@/src/hooks/usePriceInsight';
import { useProducts } from '@/src/hooks/useProducts';

export default function CheckScreen() {
  const params = useLocalSearchParams<{ productCode?: string }>();
  const { locale, t } = useI18n();
  const marketCode = useSelectedMarket();
  const products = useProducts();
  const markets = useMarkets();
  const checkMutation = usePriceCheck();
  const {
    data: priceInsightData,
    error: priceInsightError,
    isPending: priceInsightPending,
    mutate: requestPriceInsight,
  } = usePriceInsight();

  useEffect(() => {
    if (!checkMutation.data) {
      return;
    }
    requestPriceInsight({
      productCode: checkMutation.data.productCode,
      marketCode: checkMutation.data.marketCode,
      quotedPrice: checkMutation.data.quotedPrice,
      unitCode: checkMutation.data.unitCode,
      locale,
      includeOptionalPhrase: false,
    });
  }, [checkMutation.data, locale, requestPriceInsight]);

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  return (
    <Screen>
      <AppText variant="title">{t('checkPrice')}</AppText>
      <AppText muted>Backend price data remains the source of truth. Agent text is explanatory only.</AppText>
      <PriceCheckForm
        key={params.productCode ?? 'manual-check'}
        defaultMarketCode={marketCode}
        defaultProductCode={params.productCode}
        loading={checkMutation.isPending}
        markets={markets.data}
        products={products.data}
        onSubmit={(request) => checkMutation.mutate(request)}
      />
      {checkMutation.error ? <ErrorState message={getFriendlyErrorMessage(checkMutation.error)} /> : null}
      {checkMutation.data ? <PriceCheckResultCard result={checkMutation.data} /> : null}
      {priceInsightPending ? <LoadingState /> : null}
      {priceInsightError ? <ErrorState message={getFriendlyErrorMessage(priceInsightError)} /> : null}
      {priceInsightData ? (
        <AgentInsightCard insight={priceInsightData} priceCheckVerdict={checkMutation.data?.verdict} />
      ) : null}
    </Screen>
  );
}

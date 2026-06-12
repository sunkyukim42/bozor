import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import { AgentInsightCard } from '@/src/components/agent/AgentInsightCard';
import { AppCard } from '@/src/components/common/AppCard';
import { AppHeader } from '@/src/components/common/AppHeader';
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
  const { locale } = useI18n();
  const [formKey, setFormKey] = useState(0);
  const marketCode = useSelectedMarket();
  const products = useProducts();
  const markets = useMarkets();
  const checkMutation = usePriceCheck();
  const priceInsightMutation = usePriceInsight();
  const requestPriceInsight = priceInsightMutation.mutate;

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

  function handleReset() {
    checkMutation.reset();
    priceInsightMutation.reset();
    setFormKey((value) => value + 1);
  }

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  return (
    <Screen>
      <AppHeader title="Price Check" subtitle="AI Price Guide" />
      <AppCard>
        <AppText>
          {"Select a product and market, then enter the price you were quoted. We'll compare it against the fair range."}
        </AppText>
      </AppCard>
      <PriceCheckForm
        key={`${params.productCode ?? 'manual-check'}-${formKey}`}
        defaultMarketCode={marketCode}
        defaultProductCode={params.productCode}
        loading={checkMutation.isPending}
        markets={markets.data}
        products={products.data}
        onSubmit={(request) => checkMutation.mutate(request)}
      />
      {checkMutation.error ? <ErrorState message={getFriendlyErrorMessage(checkMutation.error)} /> : null}
      {checkMutation.data ? <PriceCheckResultCard result={checkMutation.data} onReset={handleReset} /> : null}
      {priceInsightMutation.isPending ? <LoadingState /> : null}
      {priceInsightMutation.error ? <ErrorState message={getFriendlyErrorMessage(priceInsightMutation.error)} /> : null}
      {priceInsightMutation.data ? (
        <AgentInsightCard insight={priceInsightMutation.data} priceCheckVerdict={checkMutation.data?.verdict} />
      ) : null}
    </Screen>
  );
}

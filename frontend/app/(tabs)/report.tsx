import { useLocalSearchParams } from 'expo-router';

import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ReportPriceForm } from '@/src/components/report/ReportPriceForm';
import { ReportStatusCard } from '@/src/components/report/ReportStatusCard';
import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useProducts } from '@/src/hooks/useProducts';
import { useReportPrice } from '@/src/hooks/useReportPrice';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';

export default function ReportScreen() {
  const params = useLocalSearchParams<{ productCode?: string }>();
  const { t } = useI18n();
  const selectedMarketCode = useAppSettingsStore((state) => state.selectedMarketCode);
  const products = useProducts();
  const markets = useMarkets();
  const reportMutation = useReportPrice();

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  return (
    <Screen>
      <AppText variant="title">{t('reportPrice')}</AppText>
      <AppText muted>제보는 검토 후 시세에 반영됩니다.</AppText>
      <ReportPriceForm
        key={params.productCode ?? 'manual-report'}
        defaultMarketCode={selectedMarketCode}
        defaultProductCode={params.productCode}
        loading={reportMutation.isPending}
        markets={markets.data}
        products={products.data}
        onSubmit={(request) => reportMutation.mutate(request)}
      />
      {reportMutation.error ? <ErrorState message={getFriendlyErrorMessage(reportMutation.error)} /> : null}
      {reportMutation.data ? <ReportStatusCard report={reportMutation.data} /> : null}
    </Screen>
  );
}

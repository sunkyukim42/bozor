import { useLocalSearchParams } from 'expo-router';

import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import { ReportInspectionCard } from '@/src/components/agent/ReportInspectionCard';
import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ReportPriceForm } from '@/src/components/report/ReportPriceForm';
import { ReportStatusCard } from '@/src/components/report/ReportStatusCard';
import { useI18n } from '@/src/hooks/useI18n';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useProducts } from '@/src/hooks/useProducts';
import { useReportInspect } from '@/src/hooks/useReportInspect';
import { useReportPrice } from '@/src/hooks/useReportPrice';

export default function ReportScreen() {
  const params = useLocalSearchParams<{ productCode?: string }>();
  const { locale, t } = useI18n();
  const marketCode = useSelectedMarket();
  const products = useProducts();
  const markets = useMarkets();
  const reportMutation = useReportPrice();
  const reportInspectMutation = useReportInspect();

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  return (
    <Screen>
      <AppText variant="title">{t('reportPrice')}</AppText>
      <AppText muted>Reports stay under review before they affect price summaries.</AppText>
      <ReportPriceForm
        key={params.productCode ?? 'manual-report'}
        defaultMarketCode={marketCode}
        defaultProductCode={params.productCode}
        inspectLoading={reportInspectMutation.isPending}
        loading={reportMutation.isPending}
        markets={markets.data}
        products={products.data}
        onInspect={(request) =>
          reportInspectMutation.mutate({
            productCode: request.productCode ?? undefined,
            rawProductName: request.rawProductName ?? undefined,
            marketCode: request.marketCode,
            submittedPrice: request.submittedPrice,
            submittedUnit: request.submittedUnit,
            locale,
          })
        }
        onSubmit={(request) => reportMutation.mutate(request)}
      />
      {reportInspectMutation.error ? <ErrorState message={getFriendlyErrorMessage(reportInspectMutation.error)} /> : null}
      {reportInspectMutation.data ? <ReportInspectionCard inspection={reportInspectMutation.data} /> : null}
      {reportMutation.error ? <ErrorState message={getFriendlyErrorMessage(reportMutation.error)} /> : null}
      {reportMutation.data ? <ReportStatusCard report={reportMutation.data} /> : null}
    </Screen>
  );
}

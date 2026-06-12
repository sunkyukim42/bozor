import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import type { PriceReportCreateRequest } from '@/src/api/apiTypes';
import { ReportInspectionCard } from '@/src/components/agent/ReportInspectionCard';
import { AppCard } from '@/src/components/common/AppCard';
import { AppHeader } from '@/src/components/common/AppHeader';
import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ReportPriceForm, type ReportDraftDisplay } from '@/src/components/report/ReportPriceForm';
import { ReportStatusCard } from '@/src/components/report/ReportStatusCard';
import { useI18n } from '@/src/hooks/useI18n';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useProducts } from '@/src/hooks/useProducts';
import { useReportInspect } from '@/src/hooks/useReportInspect';
import { useReportPrice } from '@/src/hooks/useReportPrice';

export default function ReportScreen() {
  const params = useLocalSearchParams<{ productCode?: string }>();
  const { locale } = useI18n();
  const [formKey, setFormKey] = useState(0);
  const [lastDraft, setLastDraft] = useState<ReportDraftDisplay | null>(null);
  const marketCode = useSelectedMarket();
  const products = useProducts();
  const markets = useMarkets();
  const reportMutation = useReportPrice();
  const reportInspectMutation = useReportInspect();

  function inspectReport(request: PriceReportCreateRequest) {
    reportInspectMutation.mutate({
      productCode: request.productCode ?? undefined,
      rawProductName: request.rawProductName ?? undefined,
      marketCode: request.marketCode,
      submittedPrice: request.submittedPrice,
      submittedUnit: request.submittedUnit,
      locale,
    });
  }

  function submitReport(request: PriceReportCreateRequest, draft: ReportDraftDisplay) {
    setLastDraft(draft);
    reportMutation.mutate(request);
  }

  function resetReport() {
    reportMutation.reset();
    reportInspectMutation.reset();
    setLastDraft(null);
    setFormKey((value) => value + 1);
  }

  if (products.isLoading || markets.isLoading) {
    return <LoadingState />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  if (reportMutation.data) {
    return (
      <Screen>
        <AppHeader title="Report a Price" subtitle="Community price update" />
        <ReportStatusCard report={reportMutation.data} draft={lastDraft} onReset={resetReport} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Report a Price" subtitle="Community price update" />
      <AppCard>
        <AppText>
          {"Help the community by sharing prices you've seen. Your reports improve price accuracy for everyone."}
        </AppText>
      </AppCard>
      <ReportPriceForm
        key={`${params.productCode ?? 'manual-report'}-${formKey}`}
        defaultMarketCode={marketCode}
        defaultProductCode={params.productCode}
        inspectLoading={reportInspectMutation.isPending}
        loading={reportMutation.isPending}
        markets={markets.data}
        products={products.data}
        onInspect={inspectReport}
        onSubmit={submitReport}
      />
      {reportInspectMutation.error ? <ErrorState message={getFriendlyErrorMessage(reportInspectMutation.error)} /> : null}
      {reportInspectMutation.data ? <ReportInspectionCard inspection={reportInspectMutation.data} /> : null}
      {reportMutation.error ? <ErrorState message={getFriendlyErrorMessage(reportMutation.error)} /> : null}
    </Screen>
  );
}

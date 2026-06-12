import { USE_MOCK_API, request } from '@/src/api/apiClient';
import {
  adaptFieldSurveyPlan,
  adaptMarketBriefing,
  adaptPriceInsight,
  adaptProductNormalize,
  adaptReportInspect,
} from '@/src/api/adapters/agentAdapter';
import type {
  FieldSurveyPlanRequest,
  FieldSurveyPlanResponse,
  MarketBriefingRequest,
  MarketBriefingResponse,
  PriceInsightRequest,
  PriceInsightResponse,
  ProductNormalizeRequest,
  ProductNormalizeResponse,
  ReportInspectRequest,
  ReportInspectResponse,
} from '@/src/api/agentTypes';
import {
  getMockFieldSurveyPlan,
  getMockMarketBriefing,
  getMockPriceInsight,
  inspectMockReport,
  normalizeMockProduct,
} from '@/src/api/mockAgentApi';

export async function normalizeProduct(
  requestBody: ProductNormalizeRequest,
): Promise<ProductNormalizeResponse> {
  if (USE_MOCK_API) {
    return normalizeMockProduct(requestBody);
  }
  const { rawProductName, locale } = requestBody;
  return request<unknown>('/api/v1/agent/product-normalize', {
    method: 'POST',
    body: JSON.stringify({ rawProductName, locale }),
  }).then(adaptProductNormalize);
}

export async function inspectReport(requestBody: ReportInspectRequest): Promise<ReportInspectResponse> {
  if (USE_MOCK_API) {
    return inspectMockReport(requestBody);
  }
  return request<unknown>('/api/v1/agent/report-inspect', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  }).then(adaptReportInspect);
}

export async function getPriceInsight(requestBody: PriceInsightRequest): Promise<PriceInsightResponse> {
  if (USE_MOCK_API) {
    return getMockPriceInsight(requestBody);
  }
  return request<unknown>('/api/v1/agent/price-insight', {
    method: 'POST',
    body: JSON.stringify({
      productCode: requestBody.productCode,
      marketCode: requestBody.marketCode,
      quotedPrice: requestBody.quotedPrice,
      unitCode: requestBody.unitCode,
      locale: requestBody.locale,
      includeBargainPhrase: requestBody.includeBargainPhrase ?? requestBody.includeOptionalPhrase ?? false,
    }),
  }).then(adaptPriceInsight);
}

export async function getMarketBriefing(requestBody: MarketBriefingRequest): Promise<MarketBriefingResponse> {
  if (USE_MOCK_API) {
    return getMockMarketBriefing(requestBody);
  }
  return request<unknown>('/api/v1/agent/market-briefing', {
    method: 'POST',
    body: JSON.stringify({
      marketCode: requestBody.marketCode,
      summaryDate: requestBody.summaryDate ?? requestBody.date,
      locale: requestBody.locale,
    }),
  }).then(adaptMarketBriefing);
}

export async function getFieldSurveyPlan(requestBody: FieldSurveyPlanRequest): Promise<FieldSurveyPlanResponse> {
  if (USE_MOCK_API) {
    return getMockFieldSurveyPlan(requestBody);
  }
  return request<unknown>('/api/v1/agent/field-survey-plan', {
    method: 'POST',
    body: JSON.stringify({
      marketCode: requestBody.marketCode,
      summaryDate: requestBody.summaryDate ?? requestBody.date,
      locale: requestBody.locale,
    }),
  }).then(adaptFieldSurveyPlan);
}

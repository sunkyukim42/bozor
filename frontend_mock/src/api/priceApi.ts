import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type {
  PriceCheckRequest,
  PriceCheckResponse,
  PriceHistoryResponse,
  PriceSummaryResponse,
} from '@/src/api/apiTypes';
import {
  adaptPriceCheck,
  adaptPriceHistory,
  adaptPriceSummary,
} from '@/src/api/adapters/priceAdapter';
import { checkMockPrice, getMockPriceHistory, getMockPriceSummary } from '@/src/api/mockApi';

export async function getPriceSummary(
  productCode: string,
  marketCode?: string,
  date?: string,
): Promise<PriceSummaryResponse> {
  if (USE_MOCK_API) {
    return getMockPriceSummary(productCode, marketCode);
  }
  const params = new URLSearchParams({ productCode });
  if (marketCode) params.set('marketCode', marketCode);
  if (date) params.set('date', date);
  return adaptPriceSummary(await request<unknown>(`/api/v1/prices/summary?${params.toString()}`));
}

export async function getPriceHistory(
  productCode: string,
  marketCode?: string,
  from?: string,
  to?: string,
): Promise<PriceHistoryResponse> {
  if (USE_MOCK_API) {
    return getMockPriceHistory(productCode, marketCode, from, to);
  }
  const params = new URLSearchParams({ productCode });
  if (marketCode) params.set('marketCode', marketCode);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return adaptPriceHistory(await request<unknown>(`/api/v1/prices/history?${params.toString()}`));
}

export async function checkPrice(requestBody: PriceCheckRequest): Promise<PriceCheckResponse> {
  if (USE_MOCK_API) {
    return checkMockPrice(requestBody);
  }
  const rawCheck = await request<unknown>('/api/v1/prices/check', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  const summary = await getSummaryForDisplay(requestBody);
  return adaptPriceCheck(rawCheck, summary);
}

async function getSummaryForDisplay(requestBody: PriceCheckRequest): Promise<PriceSummaryResponse | undefined> {
  try {
    return await getPriceSummary(requestBody.productCode, requestBody.marketCode);
  } catch {
    return undefined;
  }
}

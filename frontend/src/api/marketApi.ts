import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type { MarketResponse, MarketType } from '@/src/api/apiTypes';
import { adaptMarkets } from '@/src/api/adapters/marketAdapter';
import { getMockMarkets } from '@/src/api/mockApi';

export async function getMarkets(filter?: { type?: MarketType; city?: string }): Promise<MarketResponse[]> {
  if (USE_MOCK_API) {
    return getMockMarkets(filter);
  }
  const params = new URLSearchParams();
  if (filter?.type) params.set('type', filter.type);
  if (filter?.city) params.set('city', filter.city);
  const query = params.toString();
  return adaptMarkets(await request<unknown>(`/api/v1/markets${query ? `?${query}` : ''}`));
}

export async function getMarketByCode(marketCode: string): Promise<MarketResponse> {
  const market = (await getMarkets()).find((item) => item.code === marketCode);
  if (!market) {
    throw new Error('Market not found');
  }
  return market;
}

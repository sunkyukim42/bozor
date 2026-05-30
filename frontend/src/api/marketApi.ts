import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type { MarketResponse, MarketType } from '@/src/api/apiTypes';
import { getMockMarkets } from '@/src/api/mockApi';

export function getMarkets(filter?: { type?: MarketType; city?: string }): Promise<MarketResponse[]> {
  if (USE_MOCK_API) {
    return getMockMarkets(filter);
  }
  const params = new URLSearchParams();
  if (filter?.type) params.set('type', filter.type);
  if (filter?.city) params.set('city', filter.city);
  const query = params.toString();
  return request<MarketResponse[]>(`/api/v1/markets${query ? `?${query}` : ''}`);
}

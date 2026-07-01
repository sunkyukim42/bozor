import { useQuery } from '@tanstack/react-query';

import type { MarketType } from '@/src/api/apiTypes';
import { getMarkets } from '@/src/api/marketApi';

export function useMarkets(filter?: { type?: MarketType; city?: string }) {
  return useQuery({
    queryKey: ['markets', filter ?? {}],
    queryFn: () => getMarkets(filter),
  });
}

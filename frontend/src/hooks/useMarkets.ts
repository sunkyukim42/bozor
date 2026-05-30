import { useQuery } from '@tanstack/react-query';

import { getMarkets } from '@/src/api/marketApi';

export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: () => getMarkets(),
  });
}

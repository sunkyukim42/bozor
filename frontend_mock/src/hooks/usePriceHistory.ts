import { useQuery } from '@tanstack/react-query';

import { getPriceHistory } from '@/src/api/priceApi';

export function usePriceHistory(productCode?: string, marketCode?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['priceHistory', productCode, marketCode, from, to],
    queryFn: () => getPriceHistory(productCode ?? '', marketCode, from, to),
    enabled: Boolean(productCode && marketCode),
    retry: false,
  });
}

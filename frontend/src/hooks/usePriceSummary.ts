import { useQuery } from '@tanstack/react-query';

import { getPriceSummary } from '@/src/api/priceApi';

export function usePriceSummary(productCode?: string, marketCode?: string, date?: string) {
  return useQuery({
    queryKey: ['priceSummary', productCode, marketCode, date],
    queryFn: () => getPriceSummary(productCode ?? '', marketCode, date),
    enabled: Boolean(productCode && marketCode),
    retry: false,
  });
}

import { useQuery } from '@tanstack/react-query';

import { getPriceSummary } from '@/src/api/priceApi';

export function usePriceSummary(productCode?: string, marketCode?: string) {
  return useQuery({
    queryKey: ['price-summary', productCode, marketCode],
    queryFn: () => getPriceSummary(productCode ?? '', marketCode),
    enabled: Boolean(productCode),
  });
}

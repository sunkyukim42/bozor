import { useQuery } from '@tanstack/react-query';

import { getPriceHistory } from '@/src/api/priceApi';

export function usePriceHistory(productCode?: string, marketCode?: string) {
  return useQuery({
    queryKey: ['price-history', productCode, marketCode],
    queryFn: () => getPriceHistory(productCode ?? '', marketCode),
    enabled: Boolean(productCode),
  });
}

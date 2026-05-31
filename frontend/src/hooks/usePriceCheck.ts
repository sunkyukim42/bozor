import { useMutation } from '@tanstack/react-query';

import type { PriceCheckRequest } from '@/src/api/apiTypes';
import { checkPrice } from '@/src/api/priceApi';

export function usePriceCheck() {
  return useMutation({
    mutationKey: ['priceCheck'],
    mutationFn: (request: PriceCheckRequest) => checkPrice(request),
  });
}

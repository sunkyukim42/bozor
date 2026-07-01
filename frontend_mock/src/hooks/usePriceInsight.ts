import { useMutation } from '@tanstack/react-query';

import { getPriceInsight } from '@/src/api/agentApi';
import type { PriceInsightRequest } from '@/src/api/agentTypes';

export function usePriceInsight() {
  return useMutation({
    mutationKey: ['agent', 'priceInsight'],
    mutationFn: (request: PriceInsightRequest) => getPriceInsight(request),
  });
}

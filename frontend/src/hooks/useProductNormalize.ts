import { useMutation } from '@tanstack/react-query';

import type { ProductNormalizeRequest } from '@/src/api/agentTypes';
import { normalizeProduct } from '@/src/api/agentApi';

export function useProductNormalize() {
  return useMutation({
    mutationKey: ['agent', 'productNormalize'],
    mutationFn: (request: ProductNormalizeRequest) => normalizeProduct(request),
  });
}

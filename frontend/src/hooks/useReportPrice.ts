import { useMutation } from '@tanstack/react-query';

import type { PriceReportCreateRequest } from '@/src/api/apiTypes';
import { createPriceReport } from '@/src/api/reportApi';

export function useReportPrice() {
  return useMutation({
    mutationFn: (request: PriceReportCreateRequest) => createPriceReport(request),
  });
}

import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type { PriceReportCreateRequest, PriceReportResponse } from '@/src/api/apiTypes';
import { adaptPriceReport } from '@/src/api/adapters/reportAdapter';
import { createMockPriceReport } from '@/src/api/mockApi';

export function createPriceReport(
  requestBody: PriceReportCreateRequest,
  options?: { anonymousKey?: string },
): Promise<PriceReportResponse> {
  if (USE_MOCK_API) {
    return createMockPriceReport(requestBody);
  }
  const headers = options?.anonymousKey ? { 'X-Anonymous-Key': options.anonymousKey } : undefined;
  return request<unknown>('/api/v1/reports', {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  }).then(adaptPriceReport);
}

import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type { PriceReportCreateRequest, PriceReportResponse } from '@/src/api/apiTypes';
import { createMockPriceReport } from '@/src/api/mockApi';

export function createPriceReport(
  requestBody: PriceReportCreateRequest,
): Promise<PriceReportResponse> {
  if (USE_MOCK_API) {
    return createMockPriceReport(requestBody);
  }
  return request<PriceReportResponse>('/api/v1/reports', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

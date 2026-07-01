import { useMutation } from '@tanstack/react-query';

import { inspectReport } from '@/src/api/agentApi';
import type { ReportInspectRequest } from '@/src/api/agentTypes';

export function useReportInspect() {
  return useMutation({
    mutationKey: ['agent', 'reportInspect'],
    mutationFn: (request: ReportInspectRequest) => inspectReport(request),
  });
}

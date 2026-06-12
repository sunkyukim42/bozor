import { useQuery } from '@tanstack/react-query';

import { getFieldSurveyPlan } from '@/src/api/agentApi';

export function useFieldSurveyPlan(marketCode?: string, summaryDate?: string, locale?: string) {
  return useQuery({
    queryKey: ['agent', 'fieldSurveyPlan', marketCode, summaryDate, locale],
    queryFn: () =>
      getFieldSurveyPlan({
        marketCode: marketCode ?? '',
        summaryDate,
        locale,
      }),
    enabled: Boolean(marketCode),
    retry: false,
  });
}

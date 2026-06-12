import { useQuery } from '@tanstack/react-query';

import { getMarketBriefing } from '@/src/api/agentApi';

export function useMarketBriefing(marketCode?: string, summaryDate?: string, locale?: string) {
  return useQuery({
    queryKey: ['agent', 'marketBriefing', marketCode, summaryDate, locale],
    queryFn: () =>
      getMarketBriefing({
        marketCode: marketCode ?? '',
        summaryDate,
        locale,
      }),
    enabled: Boolean(marketCode),
    retry: false,
  });
}

import { describe, expect, it } from '@jest/globals';

import { defaultErrorMessage } from '@/src/components/common/ErrorState';
import { emptyStateMessages } from '@/src/components/common/EmptyState';

describe('friendly state messages', () => {
  it('keeps consumer state copy friendly and non-technical', () => {
    const messages = [
      defaultErrorMessage,
      emptyStateMessages.search,
      emptyStateMessages.limitedData,
      emptyStateMessages.marketData,
      emptyStateMessages.noReports,
    ];

    expect(messages).toContain('We could not load price data. Please try again.');
    expect(messages).toContain('No reliable match found.');
    expect(messages).toContain('Limited data. Use as reference.');
    expect(messages).toContain('No recent market data yet.');

    for (const message of messages) {
      expect(message).not.toMatch(/HTTP|stack|FIELD_SURVEY|sampleCount|fairLow|fairMid|fairHigh/);
    }
  });
});

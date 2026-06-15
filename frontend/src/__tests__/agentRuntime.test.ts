import { describe, expect, it } from '@jest/globals';

import {
  formatDifyConnectionFromFlags,
  getAgentProviderStatus,
  getDifyRuntimeStatus,
  hasBackendDifyProvider,
} from '@/src/utils/agentRuntime';

describe('agent runtime display helpers', () => {
  it('describes mock mode as frontend-only without Dify', () => {
    expect(getDifyRuntimeStatus(true)).toEqual({
      label: 'Dify bypassed',
      tone: 'info',
      value: 'frontend mock mode',
    });
    expect(getAgentProviderStatus(true, true)).toBe('frontend mock provider');
  });

  it('describes real mode as backend-managed Dify with fallback', () => {
    expect(getDifyRuntimeStatus(false)).toEqual({
      label: 'Backend Dify-ready',
      tone: 'success',
      value: 'backend-managed provider with safe fallback',
    });
    expect(getAgentProviderStatus(false, true)).toBe('Spring backend Dify provider + fallback');
    expect(getAgentProviderStatus(false, false)).toBe('Spring backend mock provider');
  });

  it('formats response-level Dify connection flags defensively', () => {
    expect(formatDifyConnectionFromFlags()).toBe('not reported by this response');
    expect(formatDifyConnectionFromFlags({ difyConnected: false })).toBe('fallback/mock response');
    expect(formatDifyConnectionFromFlags({ difyConnected: true })).toBe('connected through backend');
    expect(hasBackendDifyProvider({ difyConnected: true })).toBe(true);
    expect(hasBackendDifyProvider({ difyConnected: false })).toBe(false);
  });
});

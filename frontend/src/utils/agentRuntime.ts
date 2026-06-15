import type { AgentSafetyFlags } from '@/src/api/agentTypes';

export type AgentRuntimeTone = 'info' | 'success' | 'warning';

export type AgentRuntimeStatus = {
  label: string;
  tone: AgentRuntimeTone;
  value: string;
};

export function getDifyRuntimeStatus(useMockApi: boolean): AgentRuntimeStatus {
  if (useMockApi) {
    return {
      label: 'Dify bypassed',
      tone: 'info',
      value: 'frontend mock mode',
    };
  }

  return {
    label: 'Backend Dify-ready',
    tone: 'success',
    value: 'backend-managed provider with safe fallback',
  };
}

export function getAgentProviderStatus(useMockApi: boolean, difyBacked: boolean): string {
  if (useMockApi) {
    return 'frontend mock provider';
  }

  return difyBacked ? 'Spring backend Dify provider + fallback' : 'Spring backend mock provider';
}

export function formatDifyConnectionFromFlags(flags?: AgentSafetyFlags): string {
  if (!flags) {
    return 'not reported by this response';
  }

  return flags.difyConnected ? 'connected through backend' : 'fallback/mock response';
}

export function hasBackendDifyProvider(flags?: AgentSafetyFlags): boolean {
  return flags?.difyConnected === true;
}

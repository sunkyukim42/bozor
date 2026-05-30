const env = globalThis as unknown as {
  process?: { env?: Record<string, string | undefined> };
};

export const API_BASE_URL =
  env.process?.env?.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const USE_MOCK_API = env.process?.env?.EXPO_PUBLIC_USE_MOCK_API !== 'false';

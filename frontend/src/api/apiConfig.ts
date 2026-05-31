export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

export const API_TIMEOUT_MS = 10_000;

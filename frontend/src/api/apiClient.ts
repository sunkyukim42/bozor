import type { ApiResponse } from '@/src/api/apiTypes';
import { API_BASE_URL, USE_MOCK_API } from '@/src/api/config';

export { API_BASE_URL, USE_MOCK_API };

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? `Request failed: ${response.status}`);
  }
  return payload.data;
}

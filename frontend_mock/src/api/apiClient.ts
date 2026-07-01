import { API_BASE_URL as ConfigBaseUrl, API_TIMEOUT_MS, USE_MOCK_API } from '@/src/api/apiConfig';
import { ApiError } from '@/src/api/apiErrors';

// Force empty string to use relative paths for integrated Spring Boot static hosting
const API_BASE_URL = ""; 
export { API_BASE_URL, USE_MOCK_API };

type ApiRequestInit = RequestInit & {
  timeoutMs?: number;
};

export async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { timeoutMs = API_TIMEOUT_MS, ...requestInit } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Dynamically evaluates to relative routing (e.g., "/api/v1/markets")
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers: withJsonHeader(requestInit.headers),
      signal: controller.signal,
    });
    const payload = await parsePayload(response);
    if (!response.ok) {
      throw errorFromPayload(payload, response.status);
    }
    return unwrapPayload<T>(payload, response.status);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (isAbortError(error)) {
      throw new ApiError({
        code: 'REQUEST_TIMEOUT',
        message: '요청 시간이 초과되었습니다. 네트워크 상태를 확인해 주세요.',
        status: 0,
      });
    }
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: '서버에 연결하지 못했습니다. API 주소와 네트워크 상태를 확인해 주세요.',
      status: 0,
      details: { cause: error instanceof Error ? error.message : String(error) },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function unwrapPayload<T>(payload: unknown, status: number): T {
  if (isRecord(payload) && payload.success === false) {
    throw errorFromPayload(payload, status);
  }
  if (isRecord(payload) && payload.success === true && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

function errorFromPayload(payload: unknown, status: number): ApiError {
  if (isRecord(payload) && payload.success === false && isRecord(payload.error)) {
    return new ApiError({
      code: asString(payload.error.code, `HTTP_${status}`),
      message: asString(payload.error.message, `Request failed with status ${status}`),
      status,
      details: isRecord(payload.error.details) ? payload.error.details : {},
    });
  }
  if (isRecord(payload) && typeof payload.message === 'string') {
    return new ApiError({
      code: `HTTP_${status}`,
      message: payload.message,
      status,
    });
  }
  return new ApiError({
    code: `HTTP_${status}`,
    message: `Request failed with status ${status}`,
    status,
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function withJsonHeader(headers?: HeadersInit): Headers {
  const merged = new Headers(headers);
  if (!merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json');
  }
  return merged;
}

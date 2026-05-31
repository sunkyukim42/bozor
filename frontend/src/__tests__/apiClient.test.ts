import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { request } from '@/src/api/apiClient';
import { ApiError } from '@/src/api/apiErrors';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('apiClient', () => {
  it('unwraps a wrapped success response', async () => {
    mockFetch(200, { success: true, data: [{ code: 'TOMATO' }], message: null });

    await expect(request('/api/v1/products')).resolves.toEqual([{ code: 'TOMATO' }]);
  });

  it('passes through direct array or object responses', async () => {
    mockFetch(200, [{ code: 'TOMATO' }]);

    await expect(request('/api/v1/products')).resolves.toEqual([{ code: 'TOMATO' }]);
  });

  it('preserves backend error code, message, status, and details', async () => {
    mockFetch(404, {
      success: false,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
        details: { productCode: 'UNKNOWN' },
      },
    });

    await expect(request('/api/v1/products/unknown')).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found.',
      status: 404,
      details: { productCode: 'UNKNOWN' },
    });
  });

  it('maps network errors to ApiError', async () => {
    global.fetch = jest.fn<() => Promise<Response>>().mockRejectedValue(new Error('connection refused'));

    await expect(request('/api/v1/products')).rejects.toBeInstanceOf(ApiError);
    await expect(request('/api/v1/products')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('maps timeout errors to ApiError', async () => {
    global.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    await expect(request('/api/v1/products', { timeoutMs: 1 })).rejects.toMatchObject({
      code: 'REQUEST_TIMEOUT',
    });
  });
});

function mockFetch(status: number, body: unknown): void {
  global.fetch = jest.fn<() => Promise<Response>>().mockResolvedValue(
    new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' },
      status,
    }),
  );
}

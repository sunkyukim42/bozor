import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type { ProductResponse } from '@/src/api/apiTypes';
import { getMockProductByCode, getMockProducts } from '@/src/api/mockApi';

export function getProducts(query?: string): Promise<ProductResponse[]> {
  if (USE_MOCK_API) {
    return getMockProducts(query);
  }
  const params = query ? `?query=${encodeURIComponent(query)}` : '';
  return request<ProductResponse[]>(`/api/v1/products${params}`);
}

export function getProductByCode(productCode: string): Promise<ProductResponse> {
  if (USE_MOCK_API) {
    return getMockProductByCode(productCode);
  }
  return getProducts(productCode).then((products) => {
    const product = products.find((item) => item.code === productCode);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  });
}

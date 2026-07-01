import { USE_MOCK_API, request } from '@/src/api/apiClient';
import type { ProductResponse } from '@/src/api/apiTypes';
import { adaptProduct, adaptProducts, productMatchesQuery } from '@/src/api/adapters/productAdapter';
import { getMockProductByCode, getMockProducts } from '@/src/api/mockApi';

export async function getProducts(query?: string): Promise<ProductResponse[]> {
  if (USE_MOCK_API) {
    return getMockProducts(query);
  }
  const params = query ? `?query=${encodeURIComponent(query)}` : '';
  const products = adaptProducts(await request<unknown>(`/api/v1/products${params}`));
  if (!query || products.length > 0) {
    return products;
  }
  const allProducts = adaptProducts(await request<unknown>('/api/v1/products'));
  return allProducts.filter((product) => productMatchesQuery(product, query));
}

export async function getProductByCode(productCode: string): Promise<ProductResponse> {
  if (USE_MOCK_API) {
    return getMockProductByCode(productCode);
  }
  const products = await getProducts(productCode);
  const product = products.find((item) => item.code === productCode) ?? adaptProduct({});
  if (!product.code) {
    throw new Error('Product not found');
  }
  return product;
}

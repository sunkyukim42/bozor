import { useQuery } from '@tanstack/react-query';

import { getProductByCode, getProducts } from '@/src/api/productApi';

export function useProducts(query?: string) {
  return useQuery({
    queryKey: ['products', query ?? ''],
    queryFn: () => getProducts(query),
  });
}

export function useProduct(productCode?: string) {
  return useQuery({
    queryKey: ['product', productCode],
    queryFn: () => getProductByCode(productCode ?? ''),
    enabled: Boolean(productCode),
  });
}

export const routes = {
  home: '/home',
  search: '/search',
  check: '/check',
  report: '/report',
  settings: '/settings',
  apiStatus: '/dev/api-status',
  product: (productCode: string) => ({
    pathname: '/product/[productCode]' as const,
    params: { productCode },
  }),
} as const;

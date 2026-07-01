import type { MarketResponse, ProductResponse } from '@/src/api/apiTypes';
import { formatProductSubtitle } from '@/src/utils/displayLabels';

export const OTHER_PRODUCT_VALUE = 'OTHER';

export const PRICE_CHECK_PRODUCT_CODES = ['TOMATO', 'RICE', 'EGGS', 'VEGETABLE_OIL', 'BEEF'];
export const REPORT_PRODUCT_CODES = ['TOMATO', 'RICE', 'EGGS', 'VEGETABLE_OIL', 'BEEF', 'CARROT', 'ONION'];
export const CONSUMER_MARKET_CODES = ['TASHKENT_CHORSU', 'KORZINKA_ONLINE'];
export const PRICE_CHECK_UNIT_CODES = ['KG', 'PCS_10', 'LITER', 'BUNDLE'];
export const REPORT_UNIT_CODES = ['KG', 'PCS_10', 'LITER', 'BUNDLE', 'PCS'];

export type ChoiceOption = {
  value: string;
  label: string;
  caption?: string;
  available: boolean;
  isOther?: boolean;
};

export function buildProductChoices(products: ProductResponse[], productCodes: string[]): ChoiceOption[] {
  const byCode = new Map(products.map((product) => [product.code, product]));
  return [
    ...productCodes.map((code) => {
      const product = byCode.get(code);
      return {
        value: code,
        label: product?.nameEn ?? titleCaseCode(code),
        caption: product ? formatProductSubtitle(product) : undefined,
        available: Boolean(product),
      };
    }),
    {
      value: OTHER_PRODUCT_VALUE,
      label: 'Other',
      available: true,
      isOther: true,
    },
  ];
}

export function buildMarketChoices(markets: MarketResponse[]): ChoiceOption[] {
  const byCode = new Map(markets.map((market) => [market.code, market]));
  return CONSUMER_MARKET_CODES.map((code) => {
    const market = byCode.get(code);
    return {
      value: code,
      label: market ? formatMarketChipLabel(market) : titleCaseCode(code),
      available: Boolean(market),
    };
  });
}

export function buildUnitChoices(allowedUnits: string[], defaultUnit = 'KG'): string[] {
  return Array.from(new Set([defaultUnit, ...allowedUnits]));
}

export function coerceProductChoice(defaultProductCode: string | undefined, products: ProductResponse[], allowedCodes: string[]): string {
  if (defaultProductCode && allowedCodes.includes(defaultProductCode) && products.some((product) => product.code === defaultProductCode)) {
    return defaultProductCode;
  }
  return allowedCodes.find((code) => products.some((product) => product.code === code)) ?? OTHER_PRODUCT_VALUE;
}

export function coerceMarketChoice(defaultMarketCode: string, markets: MarketResponse[]): string {
  if (CONSUMER_MARKET_CODES.includes(defaultMarketCode) && markets.some((market) => market.code === defaultMarketCode)) {
    return defaultMarketCode;
  }
  return CONSUMER_MARKET_CODES.find((code) => markets.some((market) => market.code === code)) ?? defaultMarketCode;
}

export function formatMarketChipLabel(market: Pick<MarketResponse, 'code' | 'name'>): string {
  return market.code === 'KORZINKA_ONLINE' ? 'Korzinka' : market.name;
}

function titleCaseCode(code: string): string {
  return code
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

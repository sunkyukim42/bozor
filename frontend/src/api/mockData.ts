import type { MarketResponse, PriceSummaryResponse, ProductResponse } from '@/src/api/apiTypes';

export const MOCK_DATA_NOTICE = 'development mock data only';
export const DEFAULT_MARKET_CODE = 'TASHKENT_CHORSU';

export const mockProducts: ProductResponse[] = [
  product('TOMATO', 'Tomato', 'Pomidor', 'Помидор', '토마토', true, [
    'tomato',
    'pomidor',
    'помидор',
    '토마토',
  ]),
  product('CUCUMBER', 'Cucumber', 'Bodring', 'Огурец', '오이', true, [
    'cucumber',
    'bodring',
    'огурец',
    '오이',
  ]),
  product('POTATO', 'Potato', 'Kartoshka', 'Картофель', '감자', false, [
    'potato',
    'kartoshka',
    'картофель',
    '감자',
  ]),
  product('ONION', 'Onion', 'Piyoz', 'Лук', '양파', false, ['onion', 'piyoz', 'лук', '양파']),
  product('CARROT', 'Carrot', 'Sabzi', 'Морковь', '당근', false, [
    'carrot',
    'sabzi',
    'морковь',
    '당근',
  ]),
  product('CABBAGE', 'Cabbage', 'Karam', 'Капуста', '양배추', false, [
    'cabbage',
    'karam',
    'капуста',
    '양배추',
  ]),
  product('EGGPLANT', 'Eggplant', 'Baqlajon', 'Баклажан', '가지', true, [
    'eggplant',
    'baqlajon',
    'баклажан',
    '가지',
  ]),
  product('BELL_PEPPER', 'Bell pepper', 'Bolgor qalampiri', 'Болгарский перец', '파프리카', true, [
    'bell pepper',
    'qalampir',
    'перец',
    '파프리카',
  ]),
  product('APPLE', 'Apple', 'Olma', 'Яблоко', '사과', false, ['apple', 'olma', 'яблоко', '사과']),
  product('MELON', 'Melon', 'Qovun', 'Дыня', '멜론', true, ['melon', 'qovun', 'дыня', '멜론']),
];

export const mockMarkets: MarketResponse[] = [
  market('TASHKENT_CHORSU', 'Chorsu Bazaar', 'Tashkent', 'Shaykhontohur', 'BAZAAR', 41.326, 69.234),
  market('TASHKENT_ALAY', 'Alay Bazaar', 'Tashkent', 'Yunusabad', 'BAZAAR', 41.315, 69.285),
  market('KORZINKA_ONLINE', 'Korzinka online', 'Tashkent', null, 'ONLINE_RETAIL', null, null),
  market('MAKRO_ONLINE', 'Makro online', 'Tashkent', null, 'ONLINE_RETAIL', null, null),
  market('UZBEKISTAN_NATIONAL', 'Uzbekistan national average', null, null, 'NATIONAL_AVERAGE', null, null),
];

const basePrices: Record<string, { low: number; mid: number; high: number; samples: number }> = {
  TOMATO: { low: 14000, mid: 16500, high: 18500, samples: 22 },
  CUCUMBER: { low: 8500, mid: 10000, high: 11800, samples: 18 },
  POTATO: { low: 5200, mid: 6200, high: 7600, samples: 16 },
  ONION: { low: 4200, mid: 5200, high: 6400, samples: 14 },
  CARROT: { low: 6200, mid: 7400, high: 8800, samples: 12 },
  CABBAGE: { low: 4800, mid: 5600, high: 6900, samples: 9 },
  EGGPLANT: { low: 12500, mid: 14800, high: 17200, samples: 10 },
  BELL_PEPPER: { low: 15000, mid: 17800, high: 20500, samples: 8 },
  APPLE: { low: 11800, mid: 14000, high: 16500, samples: 20 },
  MELON: { low: 7000, mid: 8500, high: 10300, samples: 7 },
};

export const mockSummaries: PriceSummaryResponse[] = mockProducts.flatMap((productValue) =>
  mockMarkets.map((marketValue, marketIndex) => buildSummary(productValue, marketValue, marketIndex)),
);

export function findMockSummary(productCode: string, marketCode = DEFAULT_MARKET_CODE): PriceSummaryResponse {
  const exact = mockSummaries.find(
    (summary) => summary.productCode === productCode && summary.marketCode === marketCode,
  );
  if (exact) {
    return exact;
  }

  const fallback = mockSummaries.find((summary) => summary.productCode === productCode);
  if (fallback) {
    return fallback;
  }

  throw new Error(`No mock summary for ${productCode}`);
}

export function buildMockHistory(productCode: string, marketCode = DEFAULT_MARKET_CODE): PriceSummaryResponse[] {
  const summary = findMockSummary(productCode, marketCode);
  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date('2026-05-30T00:00:00.000Z');
    date.setUTCDate(date.getUTCDate() - (20 - index));
    const wave = (index % 7) - 3;
    const delta = wave * 160;
    return {
      ...summary,
      summaryDate: date.toISOString().slice(0, 10),
      fairLow: summary.fairLow + delta,
      fairMid: summary.fairMid + delta,
      fairHigh: summary.fairHigh + delta,
      minPrice: summary.minPrice + delta,
      maxPrice: summary.maxPrice + delta,
    };
  });
}

function product(
  code: string,
  nameEn: string,
  nameUz: string,
  nameRu: string,
  nameKo: string,
  seasonal: boolean,
  aliases: string[],
): ProductResponse {
  return {
    id: `product-${code.toLowerCase()}`,
    code,
    nameKo,
    nameEn,
    nameUz,
    nameRu,
    defaultUnit: 'KG',
    seasonal,
    active: true,
    aliases: aliases.map((alias) => ({ locale: 'mixed', alias })),
  };
}

function market(
  code: string,
  name: string,
  city: string | null,
  district: string | null,
  marketType: MarketResponse['marketType'],
  latitude: number | null,
  longitude: number | null,
): MarketResponse {
  return {
    id: `market-${code.toLowerCase()}`,
    code,
    name,
    city,
    district,
    address: district ? `${name} area` : null,
    latitude,
    longitude,
    marketType,
    active: true,
  };
}

function buildSummary(
  productValue: ProductResponse,
  marketValue: MarketResponse,
  marketIndex: number,
): PriceSummaryResponse {
  const base = basePrices[productValue.code];
  const multiplier = marketValue.marketType === 'ONLINE_RETAIL' ? 1.08 : 1 + marketIndex * 0.015;
  const fairLow = roundToHundred(base.low * multiplier);
  const fairMid = roundToHundred(base.mid * multiplier);
  const fairHigh = roundToHundred(base.high * multiplier);
  const sampleCount = Math.max(3, base.samples - marketIndex);

  return {
    productCode: productValue.code,
    productName: productValue.nameEn,
    marketCode: marketValue.code,
    marketName: marketValue.name,
    summaryDate: '2026-05-30',
    summaryGrain: 'DAILY',
    fairLow,
    fairMid,
    fairHigh,
    minPrice: roundToHundred(fairLow * 0.92),
    maxPrice: roundToHundred(fairHigh * 1.1),
    sampleCount,
    confidenceScore: Number(Math.min(0.92, 0.42 + sampleCount / 45 + (marketIndex === 0 ? 0.12 : 0)).toFixed(3)),
    sourceBreakdown:
      marketValue.code === DEFAULT_MARKET_CODE
        ? { FIELD_SURVEY: 12, USER_REPORT: 8, STAT_UZ: 1, KORZINKA: 1 }
        : { FIELD_SURVEY: 4, USER_REPORT: 3, STAT_UZ: 1, MAKRO: marketValue.code === 'MAKRO_ONLINE' ? 1 : 0 },
    computedAt: '2026-05-30T00:00:00+09:00',
  };
}

function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

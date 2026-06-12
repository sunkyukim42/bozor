import type { MarketResponse, PriceSummaryResponse, ProductResponse } from '@/src/api/apiTypes';

export const SURVEY_DATE = '2026-06-05';
export const SURVEY_LOCATION = 'Chorsu Bazaar and Korzinka, Tashkent';
export const MOCK_DATA_NOTICE = 'field survey mock data / development demo data only';
export const DEFAULT_MARKET_CODE = 'TASHKENT_CHORSU';

type PriceRange = {
  low: number;
  mid: number;
  high: number;
  note?: string;
};

type SurveyObservation = PriceRange & {
  dataSource: 'FIELD_SURVEY' | 'KORZINKA_REFERENCE';
  confidenceScore: number;
};

type DemoPrice = {
  low: number;
  mid: number;
  high: number;
  samples: number;
};

export const mockProducts: ProductResponse[] = [
  product('TOMATO', 'Tomato', 'Pomidor', 'Помидор', '토마토', true, 'KG', [
    'tomato',
    'pomidor',
    'помидор',
    '토마토',
    'pink tomato',
    'red tomato',
    'greenhouse tomato',
    'local tomato',
    'cherry tomato',
  ]),
  product('CUCUMBER', 'Cucumber', 'Bodring', 'Огурец', '오이', true, 'KG', [
    'cucumber',
    'bodring',
    'огурец',
    '오이',
    'greenhouse cucumber',
    'local cucumber',
  ]),
  product('POTATO', 'Potato', 'Kartoshka', 'Картофель', '감자', false, 'KG', [
    'potato',
    'kartoshka',
    'картофель',
    '감자',
    'local potato',
    'russian potato',
  ]),
  product('ONION', 'Onion', 'Piyoz', 'Лук', '양파', false, 'KG', [
    'onion',
    'piyoz',
    'лук',
    '양파',
    'white onion',
    'red onion',
  ]),
  product('CARROT', 'Carrot', 'Sabzi', 'Морковь', '당근', false, 'KG', [
    'carrot',
    'sabzi',
    'морковь',
    '당근',
    'red carrot',
    'yellow carrot',
    'local carrot',
  ]),
  product('CABBAGE', 'Cabbage', 'Karam', 'Капуста', '양배추', false, 'KG', [
    'cabbage',
    'karam',
    'капуста',
    '양배추',
  ]),
  product('EGGPLANT', 'Eggplant', 'Baqlajon', 'Баклажан', '가지', true, 'KG', [
    'eggplant',
    'baqlajon',
    'баклажан',
    '가지',
  ]),
  product('BELL_PEPPER', 'Bell pepper', 'Bolgor qalampiri', 'Болгарский перец', '파프리카', true, 'KG', [
    'bell pepper',
    'qalampir',
    'перец',
    '파프리카',
  ]),
  product('APPLE', 'Apple', 'Olma', 'Яблоко', '사과', false, 'KG', [
    'apple',
    'olma',
    'яблоко',
    '사과',
    'green apple',
    'red apple',
    'golden apple',
    'imported apple',
  ]),
  product('MELON', 'Melon', 'Qovun', 'Дыня', '멜론', true, 'KG', [
    'melon',
    'qovun',
    'дыня',
    '멜론',
  ]),
  product('RICE', 'Rice', 'Guruch', 'Рис', '쌀', false, 'KG', [
    'rice',
    'guruch',
    'рис',
    '쌀',
    'alanga rice',
    'laser rice',
  ]),
  product('EGGS', 'Eggs', 'Tuxum', 'Яйца', '계란', false, 'PCS_10', [
    'eggs',
    'egg',
    'tuxum',
    'яйца',
    '계란',
    'farm eggs',
    'factory eggs',
  ]),
  product('VEGETABLE_OIL', 'Vegetable Oil', 'O‘simlik yog‘i', 'Растительное масло', '식용유', false, 'LITER', [
    'vegetable oil',
    'oil',
    'o‘simlik yog‘i',
    "o'simlik yog'i",
    'osimlik yogi',
    'растительное масло',
    '식용유',
    'cottonseed oil',
    'sunflower oil',
  ]),
  product('BEEF', 'Beef', 'Mol go‘shti', 'Говядина', '소고기', false, 'KG', [
    'beef',
    'mol go‘shti',
    "mol go'shti",
    'mol goshti',
    'говядина',
    '소고기',
    'boneless beef',
    'beef with bone',
  ]),
];

export const mockMarkets: MarketResponse[] = [
  market('TASHKENT_CHORSU', 'Chorsu Bazaar', 'Tashkent', 'Shaykhontohur', 'BAZAAR', 41.326, 69.234),
  market('TASHKENT_ALAY', 'Alay Bazaar', 'Tashkent', 'Yunusabad', 'BAZAAR', 41.315, 69.285),
  market('KORZINKA_ONLINE', 'Korzinka online', 'Tashkent', null, 'ONLINE_RETAIL', null, null),
  market('MAKRO_ONLINE', 'Makro online', 'Tashkent', null, 'ONLINE_RETAIL', null, null),
  market('UZBEKISTAN_NATIONAL', 'Uzbekistan national average', null, null, 'NATIONAL_AVERAGE', null, null),
];

const surveyPrices: Record<string, Partial<Record<string, SurveyObservation>>> = {
  TOMATO: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(10000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', {
      low: 7990,
      mid: 10490,
      high: 12990,
      note: 'Korzinka reference listed Red Greenhouse at 7,990 UZS/kg and Pink Greenhouse at 12,990 UZS/kg.',
    }),
  },
  CUCUMBER: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(10000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(8000)),
  },
  CARROT: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', rangePrice(8000, 10000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(6990)),
  },
  POTATO: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(8000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(7950)),
  },
  ONION: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(5000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(3990)),
  },
  APPLE: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(40000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(34990)),
  },
  RICE: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(15000)),
    KORZINKA_ONLINE: survey(
      'KORZINKA_REFERENCE',
      singlePrice(14989, 'Korzinka reference was 13,490 UZS for 900g; normalized to about 14,989 UZS/kg.'),
    ),
  },
  EGGS: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', rangePrice(15000, 17000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(22490)),
  },
  VEGETABLE_OIL: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(19000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(20890)),
  },
  BEEF: {
    TASHKENT_CHORSU: survey('FIELD_SURVEY', singlePrice(95000)),
    KORZINKA_ONLINE: survey('KORZINKA_REFERENCE', singlePrice(99990)),
  },
};

const demoPrices: Record<string, DemoPrice> = {
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
  RICE: { low: 13500, mid: 15000, high: 16500, samples: 4 },
  EGGS: { low: 15000, mid: 16000, high: 17000, samples: 4 },
  VEGETABLE_OIL: { low: 18000, mid: 19500, high: 21000, samples: 4 },
  BEEF: { low: 90000, mid: 97000, high: 104000, samples: 4 },
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
    const date = new Date(`${summary.summaryDate}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - (20 - index));
    const wave = (index % 7) - 3;
    const delta = wave * 160;
    return {
      ...summary,
      summaryDate: date.toISOString().slice(0, 10),
      fairLow: Math.max(0, summary.fairLow + delta),
      fairMid: Math.max(0, summary.fairMid + delta),
      fairHigh: Math.max(0, summary.fairHigh + delta),
      minPrice: Math.max(0, summary.minPrice + delta),
      maxPrice: Math.max(0, summary.maxPrice + delta),
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
  defaultUnit: string,
  aliases: string[],
): ProductResponse {
  return {
    id: `product-${code.toLowerCase()}`,
    code,
    nameKo,
    nameEn,
    nameUz,
    nameRu,
    defaultUnit,
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
  const observation = surveyPrices[productValue.code]?.[marketValue.code];
  if (observation) {
    return buildSurveySummary(productValue, marketValue, observation);
  }

  return buildDemoSummary(productValue, marketValue, marketIndex);
}

function buildSurveySummary(
  productValue: ProductResponse,
  marketValue: MarketResponse,
  observation: SurveyObservation,
): PriceSummaryResponse {
  return {
    productCode: productValue.code,
    productName: productValue.nameEn,
    marketCode: marketValue.code,
    marketName: marketValue.name,
    summaryDate: SURVEY_DATE,
    summaryGrain: 'DAILY',
    fairLow: observation.low,
    fairMid: observation.mid,
    fairHigh: observation.high,
    minPrice: observation.low,
    maxPrice: observation.high,
    sampleCount: 1,
    confidenceScore: observation.confidenceScore,
    sourceBreakdown: { [observation.dataSource]: 1 },
    computedAt: `${SURVEY_DATE}T00:00:00+05:00`,
    surveyDate: SURVEY_DATE,
    location: SURVEY_LOCATION,
    dataSource: observation.dataSource,
    dataNote: observation.note ?? 'Field survey/reference mock data for development demo use only.',
  };
}

function buildDemoSummary(
  productValue: ProductResponse,
  marketValue: MarketResponse,
  marketIndex: number,
): PriceSummaryResponse {
  const base = demoPrices[productValue.code];
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
    confidenceScore: Number(Math.min(0.68, 0.44 + sampleCount / 60).toFixed(3)),
    sourceBreakdown: { DEVELOPMENT_DEMO: sampleCount },
    computedAt: '2026-05-30T00:00:00+09:00',
    dataSource: 'DEVELOPMENT_DEMO',
    dataNote: 'Development demo data only; not field survey data.',
  };
}

function survey(dataSource: SurveyObservation['dataSource'], range: PriceRange): SurveyObservation {
  return {
    ...range,
    dataSource,
    confidenceScore: dataSource === 'FIELD_SURVEY' ? 0.58 : 0.55,
  };
}

function singlePrice(price: number, note?: string): PriceRange {
  return {
    low: roundToHundred(price * 0.95),
    mid: Math.round(price),
    high: roundToHundred(price * 1.05),
    note,
  };
}

function rangePrice(low: number, high: number, note?: string): PriceRange {
  return {
    low,
    mid: Math.round((low + high) / 2),
    high,
    note,
  };
}

function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

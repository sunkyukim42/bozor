export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type ProductAliasResponse = {
  locale: string;
  alias: string;
};

export type ProductResponse = {
  id: string;
  code: string;
  nameKo: string;
  nameEn: string;
  nameUz: string;
  nameRu: string;
  defaultUnit: string;
  seasonal: boolean;
  active: boolean;
  aliases: ProductAliasResponse[];
};

export type MarketType = 'BAZAAR' | 'SUPERMARKET' | 'ONLINE_RETAIL' | 'NATIONAL_AVERAGE';

export type MarketResponse = {
  id: string;
  code: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  marketType: MarketType;
  active: boolean;
};

export type SummaryGrain = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type SourceBreakdown = Record<string, number>;

export type PriceSummaryResponse = {
  productCode: string;
  productName: string;
  marketCode: string;
  marketName: string;
  summaryDate: string;
  summaryGrain: SummaryGrain;
  fairLow: number;
  fairMid: number;
  fairHigh: number;
  minPrice: number;
  maxPrice: number;
  sampleCount: number;
  confidenceScore: number;
  sourceBreakdown: SourceBreakdown;
  computedAt: string;
};

export type PriceHistoryItem = PriceSummaryResponse;

export type PriceHistoryResponse = {
  productCode: string;
  marketCode: string;
  from: string;
  to: string;
  grain: SummaryGrain;
  summaries: PriceHistoryItem[];
};

export type Verdict = 'CHEAP' | 'FAIR' | 'EXPENSIVE' | 'VERY_EXPENSIVE';

export type PriceCheckRequest = {
  productCode: string;
  marketCode?: string;
  quotedPrice: number;
  unitCode: string;
};

export type PriceCheckResponse = {
  productCode: string;
  marketCode: string;
  quotedPrice: number;
  unitCode: string;
  fairLow: number;
  fairMid: number;
  fairHigh: number;
  verdict: Verdict;
  verdictMessage: string;
  recommendedTargetPrice: number;
  overFairHighPercent: number;
  confidenceScore: number;
  sampleCount: number;
  sourceBreakdown: SourceBreakdown;
};

export type PriceReportCreateRequest = {
  productCode?: string;
  marketCode: string;
  rawProductName?: string;
  submittedPrice: number;
  submittedUnit: string;
  photoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type PriceReportResponse = {
  id: string;
  status: 'PENDING';
  productCode: string | null;
  marketCode: string;
  rawProductName: string | null;
  submittedPrice: number;
  submittedUnit: string;
  normalizedObservationId: null;
  reviewNote: string | null;
  submittedAt: string;
};

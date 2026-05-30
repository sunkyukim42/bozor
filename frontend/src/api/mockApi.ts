import type {
  MarketResponse,
  PriceCheckRequest,
  PriceCheckResponse,
  PriceHistoryResponse,
  PriceReportCreateRequest,
  PriceReportResponse,
  PriceSummaryResponse,
  ProductResponse,
} from '@/src/api/apiTypes';
import {
  DEFAULT_MARKET_CODE,
  buildMockHistory,
  findMockSummary,
  mockMarkets,
  mockProducts,
} from '@/src/api/mockData';
import { getOverFairHighPercent, getPriceVerdict, getVerdictMessage } from '@/src/utils/priceVerdict';

export async function getMockProducts(query?: string): Promise<ProductResponse[]> {
  await wait();
  const normalized = normalize(query ?? '');
  if (!normalized) {
    return mockProducts;
  }
  return mockProducts.filter((product) => searchableText(product).includes(normalized));
}

export async function getMockProductByCode(productCode: string): Promise<ProductResponse> {
  await wait();
  const product = mockProducts.find((item) => item.code === productCode);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

export async function getMockMarkets(filter?: {
  type?: MarketResponse['marketType'];
  city?: string;
}): Promise<MarketResponse[]> {
  await wait();
  return mockMarkets.filter((market) => {
    const matchesType = !filter?.type || market.marketType === filter.type;
    const matchesCity = !filter?.city || market.city?.toLowerCase() === filter.city.toLowerCase();
    return matchesType && matchesCity;
  });
}

export async function getMockPriceSummary(
  productCode: string,
  marketCode = DEFAULT_MARKET_CODE,
): Promise<PriceSummaryResponse> {
  await wait();
  return findMockSummary(productCode, marketCode);
}

export async function getMockPriceHistory(
  productCode: string,
  marketCode = DEFAULT_MARKET_CODE,
  from?: string,
  to?: string,
): Promise<PriceHistoryResponse> {
  await wait();
  const summaries = buildMockHistory(productCode, marketCode).filter((item) => {
    const afterFrom = !from || item.summaryDate >= from;
    const beforeTo = !to || item.summaryDate <= to;
    return afterFrom && beforeTo;
  });
  return {
    productCode,
    marketCode,
    from: from ?? summaries[0]?.summaryDate ?? '2026-05-10',
    to: to ?? summaries.at(-1)?.summaryDate ?? '2026-05-30',
    grain: 'DAILY',
    summaries,
  };
}

export async function checkMockPrice(request: PriceCheckRequest): Promise<PriceCheckResponse> {
  await wait();
  const marketCode = request.marketCode ?? DEFAULT_MARKET_CODE;
  const summary = findMockSummary(request.productCode, marketCode);
  const verdict = getPriceVerdict(request.quotedPrice, summary.fairLow, summary.fairHigh);
  return {
    productCode: summary.productCode,
    marketCode: summary.marketCode,
    quotedPrice: request.quotedPrice,
    unitCode: request.unitCode,
    fairLow: summary.fairLow,
    fairMid: summary.fairMid,
    fairHigh: summary.fairHigh,
    verdict,
    verdictMessage: getVerdictMessage(verdict),
    recommendedTargetPrice: summary.fairMid,
    overFairHighPercent: getOverFairHighPercent(request.quotedPrice, summary.fairHigh),
    confidenceScore: summary.confidenceScore,
    sampleCount: summary.sampleCount,
    sourceBreakdown: summary.sourceBreakdown,
  };
}

export async function createMockPriceReport(
  request: PriceReportCreateRequest,
): Promise<PriceReportResponse> {
  await wait();
  return {
    id: `mock-report-${Date.now()}`,
    status: 'PENDING',
    productCode: request.productCode ?? null,
    marketCode: request.marketCode,
    rawProductName: request.rawProductName ?? null,
    submittedPrice: request.submittedPrice,
    submittedUnit: request.submittedUnit,
    normalizedObservationId: null,
    reviewNote: '제보가 접수되었습니다. 검토 후 시세에 반영됩니다.',
    submittedAt: new Date().toISOString(),
  };
}

function searchableText(product: ProductResponse): string {
  return normalize(
    [
      product.code,
      product.nameKo,
      product.nameEn,
      product.nameUz,
      product.nameRu,
      ...product.aliases.map((alias) => alias.alias),
    ].join(' '),
  );
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 80));
}

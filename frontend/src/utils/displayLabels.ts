import type {
  MarketResponse,
  PriceCheckResponse,
  PriceSummaryResponse,
  ProductResponse,
  SourceBreakdown,
} from '@/src/api/apiTypes';
import type {
  PriceInsightResponse,
  ProductNormalizeResponse,
  ReportInspectResponse,
  SourceSummary,
} from '@/src/api/agentTypes';
import { formatCurrency, formatPercent } from '@/src/utils/formatCurrency';

type PriceRangeLike = Pick<PriceSummaryResponse | PriceCheckResponse, 'fairLow' | 'fairMid' | 'fairHigh'>;

type MetadataLike = {
  surveyDate?: string;
  summaryDate?: string;
  location?: string;
  dataSource?: string;
  dataNote?: string;
};

export const DISPLAY_SEPARATOR = ' · ';

export function getFairRangeDisplay(value: PriceRangeLike): {
  lowPrice: number;
  typicalPrice: number;
  highPrice: number;
} {
  return {
    lowPrice: value.fairLow,
    typicalPrice: value.fairMid,
    highPrice: value.fairHigh,
  };
}

export function getTypicalPrice(value: Pick<PriceSummaryResponse, 'fairMid'>): number {
  return value.fairMid;
}

export function formatSourceLabel(source?: string | null): string {
  switch (source) {
    case 'FIELD_SURVEY':
      return 'Based on field survey data';
    case 'KORZINKA_REFERENCE':
    case 'KORZINKA':
    case 'MAKRO':
    case 'STAT_UZ':
      return 'Reference data';
    case 'USER_REPORT':
      return 'User reports';
    case 'DEVELOPMENT_DEMO':
      return 'Development demo data';
    default:
      return source ? source.replaceAll('_', ' ').toLowerCase() : 'Reference data';
  }
}

export function formatSourceBreakdownLabel(source: string, count: number): string {
  const label = formatSourceLabel(source);
  return count > 1 ? `${label} (${count})` : label;
}

export function formatConfidenceLabel(score?: number | null): string {
  if (score === undefined || score === null) {
    return 'Data confidence unavailable';
  }

  const percent = Math.round(score * 100);
  if (percent >= 80) {
    return `High confidence (${percent}%)`;
  }
  if (percent >= 50) {
    return `Moderate confidence (${percent}%)`;
  }
  return `Limited data (${percent}%)`;
}

export function formatShortConfidenceLabel(score?: number | null): string {
  if (score === undefined || score === null) {
    return 'Data confidence';
  }

  const percent = Math.round(score * 100);
  if (percent >= 80) {
    return 'High confidence';
  }
  if (percent >= 50) {
    return 'Moderate confidence';
  }
  return 'Limited data';
}

export function formatSampleLabel(count?: number | null): string {
  if (!count || count < 3) {
    return 'Limited data';
  }
  return `${count} price reports`;
}

export function formatDataContext(
  value: Partial<Pick<PriceSummaryResponse | PriceCheckResponse | SourceSummary, 'sampleCount'>>,
): string {
  return formatSampleLabel(value.sampleCount);
}

export function formatSourceSummary(value?: SourceSummary): string | null {
  if (!value) {
    return null;
  }

  const parts = [formatDataContext(value)];
  if (value.confidenceScore !== undefined) {
    parts.push(formatConfidenceLabel(value.confidenceScore));
  }
  return parts.join(DISPLAY_SEPARATOR);
}

export function getPriceCheckDisplayMetrics(result: PriceCheckResponse): { label: string; value: string }[] {
  const metrics = [{ label: 'Target reference', value: formatCurrency(result.recommendedTargetPrice) }];
  if (result.overFairHighPercent > 0) {
    metrics.push({ label: 'Above fair range', value: formatPercent(result.overFairHighPercent) });
  }
  return metrics;
}

export function getPriceInsightDisplayMetrics(insight: PriceInsightResponse): { label: string; value: string }[] {
  const metrics: { label: string; value: string }[] = [];
  if (insight.fairMid !== undefined) {
    metrics.push({ label: 'Typical price', value: formatCurrency(insight.fairMid) });
  }
  if (insight.overFairHighPercent !== undefined && insight.overFairHighPercent > 0) {
    metrics.push({ label: 'Above fair range', value: formatPercent(insight.overFairHighPercent) });
  }
  return metrics;
}

export function formatMatchedProductLabel(inspection: Pick<ReportInspectResponse, 'normalizedProductCode'>): string | null {
  return inspection.normalizedProductCode ? `Matched product: ${inspection.normalizedProductCode}` : null;
}

export function formatProductSubtitle(product: Pick<ProductResponse, 'nameUz' | 'nameRu' | 'nameKo'>): string {
  return [product.nameUz, product.nameRu, product.nameKo].filter(Boolean).join(DISPLAY_SEPARATOR);
}

export function formatMarketLocation(market?: Pick<MarketResponse, 'code' | 'city' | 'district' | 'address'> | null): string {
  if (!market) {
    return 'Tashkent';
  }
  if (market.code === 'TASHKENT_CHORSU') {
    return 'Old City, Tashkent';
  }
  return [market.district, market.city].filter(Boolean).join(', ') || market.address || 'Tashkent';
}

export function formatMarketTypeLabel(market?: Pick<MarketResponse, 'marketType'> | null): string {
  switch (market?.marketType) {
    case 'BAZAAR':
      return 'Bazaar';
    case 'ONLINE_RETAIL':
      return 'Reference data';
    case 'SUPERMARKET':
      return 'Supermarket';
    case 'NATIONAL_AVERAGE':
      return 'National average';
    default:
      return 'Market';
  }
}

export function formatUpdatedLabel(date?: string | null): string | null {
  return date ? `Updated ${date}` : null;
}

export function formatVariantLabel(variant?: string | null): string | null {
  if (!variant || variant === 'UNKNOWN') {
    return null;
  }
  return variant
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatProductMatchTitle(result: ProductNormalizeResponse): string {
  if (result.needsHumanReview || !result.standardProductCode) {
    return 'Needs review';
  }

  const productName = result.standardProductName ?? titleCaseCode(result.standardProductCode);
  const variant = formatVariantLabel(result.variant);
  return variant ? `Matched to ${productName}${DISPLAY_SEPARATOR}${variant}` : `Matched to ${productName}`;
}

export function formatProductMatchConfidence(score: number): string {
  if (score >= 0.8) {
    return 'Confidence: High';
  }
  if (score >= 0.5) {
    return 'Confidence: Medium';
  }
  return 'Confidence: Limited';
}

export function formatSurveyMetadata(value: MetadataLike): string[] {
  const details: string[] = [];
  const date = value.surveyDate ?? value.summaryDate;

  if (date) {
    details.push(`Updated ${date}`);
  }
  if (value.dataSource) {
    details.push(formatSourceLabel(value.dataSource));
  }
  if (value.location) {
    details.push(value.location);
  }
  if (value.dataNote) {
    details.push(value.dataNote);
  }

  return details;
}

export function hasSourceData(sources?: SourceBreakdown | null): sources is SourceBreakdown {
  return Boolean(sources && Object.values(sources).some((count) => count > 0));
}

function titleCaseCode(code: string): string {
  return code
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

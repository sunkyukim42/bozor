import type { PriceCheckResponse, PriceSummaryResponse, SourceBreakdown } from '@/src/api/apiTypes';
import type { PriceInsightResponse, ReportInspectResponse, SourceSummary } from '@/src/api/agentTypes';
import { formatCurrency, formatPercent } from '@/src/utils/formatCurrency';

type PriceRangeLike = Pick<PriceSummaryResponse | PriceCheckResponse, 'fairLow' | 'fairMid' | 'fairHigh'>;

type MetadataLike = {
  surveyDate?: string;
  summaryDate?: string;
  location?: string;
  dataSource?: string;
  dataNote?: string;
};

const SOURCE_SUMMARY_SEPARATOR = ' · ';

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

export function formatDataContext(value: Partial<Pick<PriceSummaryResponse | PriceCheckResponse | SourceSummary, 'sampleCount'>>): string {
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
  return parts.join(SOURCE_SUMMARY_SEPARATOR);
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

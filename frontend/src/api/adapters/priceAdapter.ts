import type {
  PriceCheckResponse,
  PriceHistoryResponse,
  PriceSummaryResponse,
  SummaryGrain,
  Verdict,
} from '@/src/api/apiTypes';
import {
  asArray,
  asDateString,
  asNumber,
  asRecord,
  asString,
  asTimestampString,
  normalizeSourceBreakdown,
} from '@/src/api/adapters/commonAdapter';
import { getOverFairHighPercent, getVerdictMessage } from '@/src/utils/priceVerdict';

const summaryGrains: SummaryGrain[] = ['DAILY', 'WEEKLY', 'MONTHLY'];
const verdicts: Verdict[] = ['CHEAP', 'FAIR', 'EXPENSIVE', 'VERY_EXPENSIVE'];

export function adaptPriceSummary(value: unknown): PriceSummaryResponse {
  const record = asRecord(value);
  const productCode = asString(record.productCode);
  const marketCode = asString(record.marketCode);
  return {
    productCode,
    productName: asString(record.productName, productCode),
    marketCode,
    marketName: asString(record.marketName, marketCode),
    summaryDate: asDateString(record.summaryDate),
    summaryGrain: adaptSummaryGrain(record.summaryGrain),
    fairLow: asNumber(record.fairLow),
    fairMid: asNumber(record.fairMid),
    fairHigh: asNumber(record.fairHigh),
    minPrice: asNumber(record.minPrice),
    maxPrice: asNumber(record.maxPrice),
    sampleCount: asNumber(record.sampleCount),
    confidenceScore: asNumber(record.confidenceScore),
    sourceBreakdown: normalizeSourceBreakdown(record.sourceBreakdown),
    computedAt: asTimestampString(record.computedAt),
  };
}

export function adaptPriceHistory(value: unknown): PriceHistoryResponse {
  if (Array.isArray(value)) {
    const summaries = value.map(adaptPriceSummary);
    return {
      productCode: summaries[0]?.productCode ?? '',
      marketCode: summaries[0]?.marketCode ?? '',
      from: summaries[0]?.summaryDate ?? '',
      to: summaries.at(-1)?.summaryDate ?? '',
      grain: 'DAILY',
      summaries,
    };
  }
  const record = asRecord(value);
  const summaries = asArray(record.summaries).map(adaptPriceSummary);
  return {
    productCode: asString(record.productCode, summaries[0]?.productCode ?? ''),
    marketCode: asString(record.marketCode, summaries[0]?.marketCode ?? ''),
    from: asDateString(record.from, summaries[0]?.summaryDate ?? ''),
    to: asDateString(record.to, summaries.at(-1)?.summaryDate ?? ''),
    grain: adaptSummaryGrain(record.grain),
    summaries,
  };
}

export function adaptPriceCheck(
  value: unknown,
  summary?: PriceSummaryResponse,
): PriceCheckResponse {
  const record = asRecord(value);
  const fairHigh = asNumber(record.fairHigh, summary?.fairHigh ?? 0);
  const verdict = adaptVerdict(record.verdict);
  return {
    productCode: asString(record.productCode, summary?.productCode ?? ''),
    marketCode: asString(record.marketCode, summary?.marketCode ?? ''),
    quotedPrice: asNumber(record.quotedPrice),
    unitCode: asString(record.unitCode, 'KG'),
    fairLow: asNumber(record.fairLow, summary?.fairLow ?? 0),
    fairMid: asNumber(record.fairMid, summary?.fairMid ?? 0),
    fairHigh,
    verdict,
    verdictMessage: getVerdictMessage(verdict),
    recommendedTargetPrice: asNumber(record.recommendedTargetPrice, summary?.fairMid ?? 0),
    overFairHighPercent: asNumber(
      record.overFairHighPercent,
      getOverFairHighPercent(asNumber(record.quotedPrice), fairHigh),
    ),
    confidenceScore: asNumber(record.confidenceScore, summary?.confidenceScore ?? 0),
    sampleCount: asNumber(record.sampleCount, summary?.sampleCount ?? 0),
    sourceBreakdown: normalizeSourceBreakdown(record.sourceBreakdown ?? summary?.sourceBreakdown),
  };
}

function adaptSummaryGrain(value: unknown): SummaryGrain {
  const candidate = asString(value) as SummaryGrain;
  return summaryGrains.includes(candidate) ? candidate : 'DAILY';
}

function adaptVerdict(value: unknown): Verdict {
  const candidate = asString(value) as Verdict;
  return verdicts.includes(candidate) ? candidate : 'FAIR';
}

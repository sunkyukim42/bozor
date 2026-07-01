import type { PriceSummaryResponse, ProductResponse, Verdict } from '@/src/api/apiTypes';
import type {
  AgentActionDisplay,
  AgentPriority,
  AgentSafetyFlags,
  FieldSurveyPlanRequest,
  FieldSurveyPlanResponse,
  MarketBriefingRequest,
  MarketBriefingResponse,
  PriceInsightRequest,
  PriceInsightResponse,
  ProductNormalizeRequest,
  ProductNormalizeResponse,
  ReportInspectRequest,
  ReportInspectResponse,
  SourceSummary,
  SurveyTarget,
} from '@/src/api/agentTypes';
import {
  DEFAULT_MARKET_CODE,
  SURVEY_DATE,
  SURVEY_LOCATION,
  findMockSummary,
  mockMarkets,
  mockProducts,
  mockSummaries,
} from '@/src/api/mockData';
import { getOverFairHighPercent, getPriceVerdict } from '@/src/utils/priceVerdict';

const safetyFlags: AgentSafetyFlags = {
  usedOnlyBackendPrices: true,
  noSellerBlaming: true,
  noAiGeneratedFairPrice: true,
  difyConnected: false,
  noAutoApproval: true,
};

const genericTokens = new Set(['unknown', 'local', 'vegetable', 'product', 'item', 'market', 'fresh']);

export async function normalizeMockProduct(
  request: ProductNormalizeRequest,
): Promise<ProductNormalizeResponse> {
  await wait();
  const normalizedInput = normalizeText(request.rawProductName);
  const match = bestProductMatch(normalizedInput);
  if (!match || match.score <= 0) {
    return {
      rawProductName: request.rawProductName,
      standardProductCode: null,
      standardProductName: null,
      variant: 'UNKNOWN',
      matchConfidence: 0.2,
      needsHumanReview: true,
      matchedAliases: [],
      explanation: 'No reliable product alias match was found in mock catalog data.',
    };
  }

  const confidence = confidenceForScore(match.score);
  return {
    rawProductName: request.rawProductName,
    standardProductCode: match.product.code,
    standardProductName: match.product.nameEn,
    variant: variantFor(normalizedInput),
    matchConfidence: confidence,
    needsHumanReview: confidence < 0.7,
    matchedAliases: matchedAliases(match.product, normalizedInput),
    explanation:
      match.score >= 100
        ? 'Matched an exact mock product name, code, or alias.'
        : confidence < 0.7
          ? 'Matched only a weak mock product token; human review is required.'
          : 'Matched mock product aliases or meaningful name tokens.',
  };
}

export async function inspectMockReport(request: ReportInspectRequest): Promise<ReportInspectResponse> {
  await wait();
  const productCode = await resolveProductCode(request);
  if (!productCode) {
    return {
      normalizedProductCode: null,
      riskLevel: 'HIGH',
      statusSuggestion: 'REVIEW_REQUIRED',
      needsHumanReview: true,
      anomalyReasons: ['Product could not be normalized to an active mock product.'],
      reviewNote: 'Manual review is required before this report can be used.',
      userMessage: 'Thanks for the report. We need a human review because the product name was unclear.',
      safetyFlags,
    };
  }

  const summary = safeFindSummary(productCode, request.marketCode);
  if (!summary) {
    return {
      normalizedProductCode: productCode,
      riskLevel: 'HIGH',
      statusSuggestion: 'REVIEW_REQUIRED',
      needsHumanReview: true,
      anomalyReasons: ['No mock fair price summary is available for this product and market.'],
      reviewNote: 'Manual review is required because there is no reference summary.',
      userMessage: 'Thanks for the report. We need more backend data before using it.',
      safetyFlags,
    };
  }

  const highThreshold = summary.fairHigh * 1.2;
  const lowThreshold = summary.fairLow * 0.7;
  let riskLevel: ReportInspectResponse['riskLevel'] = 'LOW';
  let statusSuggestion: ReportInspectResponse['statusSuggestion'] = 'PENDING';
  const anomalyReasons: string[] = [];

  if (request.submittedPrice > highThreshold) {
    riskLevel = 'HIGH';
    statusSuggestion = 'FLAGGED';
    anomalyReasons.push('Submitted price is more than 20% above backend fair high.');
  } else if (request.submittedPrice < lowThreshold) {
    riskLevel = 'HIGH';
    statusSuggestion = 'FLAGGED';
    anomalyReasons.push('Submitted price is more than 30% below backend fair low.');
  } else if (request.submittedPrice > summary.fairHigh) {
    riskLevel = 'MEDIUM';
    statusSuggestion = 'REVIEW_REQUIRED';
    anomalyReasons.push('Submitted price is above backend fair high.');
  } else if (request.submittedPrice < summary.fairLow) {
    riskLevel = 'MEDIUM';
    statusSuggestion = 'REVIEW_REQUIRED';
    anomalyReasons.push('Submitted price is below backend fair low.');
  } else {
    anomalyReasons.push('Submitted price is within the backend fair range.');
  }

  return {
    normalizedProductCode: productCode,
    riskLevel,
    statusSuggestion,
    needsHumanReview: statusSuggestion !== 'PENDING',
    anomalyReasons,
    reviewNote: reviewNote(statusSuggestion),
    userMessage: userMessage(statusSuggestion),
    sourceSummary: sourceSummaryFrom(summary),
    safetyFlags,
  };
}

export async function getMockPriceInsight(request: PriceInsightRequest): Promise<PriceInsightResponse> {
  await wait();
  const summary = findMockSummary(request.productCode, request.marketCode);
  const backendVerdict = getPriceVerdict(request.quotedPrice, summary.fairLow, summary.fairHigh);
  const action = actionForVerdict(backendVerdict, request.productCode);
  const sourceSummary = sourceSummaryFrom(summary);
  return {
    productCode: summary.productCode,
    marketCode: summary.marketCode,
    quotedPrice: request.quotedPrice,
    unitCode: request.unitCode,
    fairLow: summary.fairLow,
    fairMid: summary.fairMid,
    fairHigh: summary.fairHigh,
    recommendedTargetPrice: summary.fairMid,
    overFairHighPercent: getOverFairHighPercent(request.quotedPrice, summary.fairHigh),
    backendVerdict,
    insightText: `Backend price check returned ${backendVerdict} for ${summary.productCode}. The fair range is ${summary.fairLow}-${summary.fairHigh} ${request.unitCode} based on stored BozorCheck summaries.`,
    confidenceExplanation: `Confidence is ${summary.confidenceScore} from ${summary.sampleCount} backend sample(s); the agent did not generate a fair price.`,
    sourceSummary: summaryText(sourceSummary),
    sourceSummaryDetail: sourceSummary,
    recommendedAction: action.description ?? 'Compare with backend price data before deciding.',
    recommendedActionDetail: {
      productCode: action.label?.split(' ')[0],
      priority: priorityFromAction(action),
      message: action.description,
    },
    optionalBargainPhrase:
      request.includeBargainPhrase || request.includeOptionalPhrase
        ? `Could you offer a price closer to ${summary.fairMid} ${request.unitCode}?`
        : null,
    safetyFlags,
  };
}

export async function getMockMarketBriefing(
  request: MarketBriefingRequest,
): Promise<MarketBriefingResponse> {
  await wait();
  const marketCode = request.marketCode || DEFAULT_MARKET_CODE;
  const requestedDate = request.summaryDate ?? request.date ?? SURVEY_DATE;
  const summaries = summariesForMarketDate(marketCode, requestedDate);
  const market = mockMarkets.find((item) => item.code === marketCode);
  const summaryDate = summaries[0]?.summaryDate ?? requestedDate;
  return {
    marketCode,
    marketName: market?.name ?? marketCode,
    summaryDate,
    briefingTitle: `${summaryDate} ${market?.name ?? marketCode} price briefing`,
    summaryText: `${market?.name ?? marketCode} has ${summaries.length} mock price summaries. This briefing uses stored survey/reference data only.`,
    highlights: summaries.slice(0, 4).map((summary) => ({
      productCode: summary.productCode,
      message: `${summary.productCode} fair midpoint is ${summary.fairMid} at ${summary.marketName}.`,
    })),
    dataWarnings: dataWarnings(summaries),
    recommendedActions: briefingActions(summaries),
    sourceSummary: aggregateSourceSummary(marketCode, summaryDate, summaries),
  };
}

export async function getMockFieldSurveyPlan(
  request: FieldSurveyPlanRequest,
): Promise<FieldSurveyPlanResponse> {
  await wait();
  const marketCode = request.marketCode || DEFAULT_MARKET_CODE;
  const requestedDate = request.summaryDate ?? request.date ?? SURVEY_DATE;
  const summaries = summariesForMarketDate(marketCode, requestedDate);
  const targets = surveyTargets(summaries);
  const market = mockMarkets.find((item) => item.code === marketCode);
  const productList = targets
    .map((target) => target.productCode)
    .filter(Boolean)
    .slice(0, 5)
    .join(', ');
  const recommendedPlan =
    targets.length > 0
      ? `Collect at least 3 observations for ${productList} at ${market?.name ?? marketCode}. Prioritize products with low sample count or low confidence score.`
      : `Keep monitoring normal reports at ${market?.name ?? marketCode}; current mock coverage is sufficient for MVP.`;
  return {
    marketCode,
    summaryDate: summaries[0]?.summaryDate ?? requestedDate,
    todaySurveyTargets: targets,
    recommendedPlan,
    surveyTargets: targets,
    recommendedActions:
      targets.length > 0
        ? targets.slice(0, 5).map((target) => ({
            label: `${target.productCode} (${target.priority})`,
            description: `Prioritize ${target.productCode} during the next field survey.`,
          }))
        : [{ label: 'Normal monitoring', description: 'Keep monitoring normal reports.' }],
    dataWarnings: targets.length > 0 ? ['Survey plan is based on backend summary coverage and confidence only.'] : [],
  };
}

function summariesForMarketDate(marketCode: string, summaryDate: string): PriceSummaryResponse[] {
  const exact = mockSummaries.filter(
    (summary) => summary.marketCode === marketCode && summary.summaryDate === summaryDate,
  );
  if (exact.length > 0) {
    return exact;
  }
  return mockSummaries.filter((summary) => summary.marketCode === marketCode);
}

async function resolveProductCode(request: ReportInspectRequest): Promise<string | null> {
  if (request.productCode?.trim()) {
    return request.productCode.trim();
  }
  if (!request.rawProductName?.trim()) {
    return null;
  }
  const normalized = await normalizeMockProduct({
    rawProductName: request.rawProductName,
    locale: request.locale,
  });
  return normalized.needsHumanReview ? null : normalized.standardProductCode;
}

function safeFindSummary(productCode: string, marketCode: string): PriceSummaryResponse | null {
  try {
    return findMockSummary(productCode, marketCode);
  } catch {
    return null;
  }
}

function sourceSummaryFrom(summary: PriceSummaryResponse): SourceSummary {
  return {
    productCode: summary.productCode,
    marketCode: summary.marketCode,
    summaryDate: summary.summaryDate,
    sampleCount: summary.sampleCount,
    confidenceScore: summary.confidenceScore,
    sourceBreakdown: summary.sourceBreakdown,
    surveyDate: summary.surveyDate,
    location: summary.location,
    dataSource: summary.dataSource,
    dataNote: summary.dataNote,
  };
}

function aggregateSourceSummary(
  marketCode: string,
  summaryDate: string,
  summaries: PriceSummaryResponse[],
): SourceSummary {
  const sampleCount = summaries.reduce((total, summary) => total + summary.sampleCount, 0);
  const confidenceScore =
    summaries.length > 0
      ? Number((summaries.reduce((total, summary) => total + summary.confidenceScore, 0) / summaries.length).toFixed(3))
      : 0;
  const sourceBreakdown: Record<string, number> = {};
  for (const summary of summaries) {
    for (const [source, count] of Object.entries(summary.sourceBreakdown)) {
      sourceBreakdown[source] = (sourceBreakdown[source] ?? 0) + count;
    }
  }
  return {
    marketCode,
    summaryDate,
    sampleCount,
    confidenceScore,
    sourceBreakdown,
    surveyDate: summaries.find((summary) => summary.surveyDate)?.surveyDate,
    location: summaries.find((summary) => summary.location)?.location ?? SURVEY_LOCATION,
    dataSource: Object.keys(sourceBreakdown).join(', '),
    dataNote: 'Mock agent summary uses stored BozorCheck survey/reference data only.',
  };
}

function summaryText(summary: SourceSummary): string {
  return [
    summary.productCode && summary.marketCode ? `${summary.productCode} at ${summary.marketCode}` : null,
    summary.summaryDate ? `date ${summary.summaryDate}` : null,
    typeof summary.sampleCount === 'number' ? `${summary.sampleCount} sample(s)` : null,
    typeof summary.confidenceScore === 'number' ? `${Math.round(summary.confidenceScore * 100)}% confidence` : null,
    summary.dataSource ? `source ${summary.dataSource}` : null,
  ]
    .filter(Boolean)
    .join(' / ');
}

function dataWarnings(summaries: PriceSummaryResponse[]): string[] {
  const lowSample = summaries.some((summary) => summary.sampleCount < 3);
  const lowConfidence = summaries.some((summary) => summary.confidenceScore < 0.6);
  if (lowSample && lowConfidence) {
    return ['Field survey/reference data has low sample counts and development-level confidence.'];
  }
  if (lowSample) {
    return ['Field survey/reference data has fewer than three samples for some products.'];
  }
  if (lowConfidence) {
    return ['Some summaries have confidence below 0.60.'];
  }
  return [];
}

function briefingActions(summaries: PriceSummaryResponse[]): AgentActionDisplay[] {
  return summaries
    .filter((summary) => summary.sampleCount < 3 || summary.confidenceScore < 0.6)
    .slice(0, 5)
    .map((summary) => ({
      label: `${summary.productCode} (${summary.sampleCount < 2 ? 'HIGH' : 'MEDIUM'})`,
      description: `Collect additional field observations for ${summary.productCode}.`,
    }));
}

function surveyTargets(summaries: PriceSummaryResponse[]): SurveyTarget[] {
  return summaries
    .map((summary) => {
      if (summary.sampleCount < 2 || summary.confidenceScore < 0.5) {
        return targetFor(summary.productCode, 'HIGH', 'Very low sample count or confidence.');
      }
      if (summary.sampleCount < 3 || summary.confidenceScore < 0.6) {
        return targetFor(summary.productCode, 'MEDIUM', 'Sample count or confidence is below the target threshold.');
      }
      return null;
    })
    .filter((target): target is SurveyTarget => target !== null);
}

function targetFor(productCode: string, priority: AgentPriority, reason: string): SurveyTarget {
  return {
    productCode,
    priority,
    reason,
    message: `Add more observations for ${productCode}.`,
  };
}

function reviewNote(statusSuggestion: ReportInspectResponse['statusSuggestion']): string {
  switch (statusSuggestion) {
    case 'FLAGGED':
      return 'Flag for manual review before any downstream use.';
    case 'REVIEW_REQUIRED':
      return 'Review manually because the submitted value is outside the fair range.';
    default:
      return 'Keep the report pending for the normal moderation queue.';
  }
}

function userMessage(statusSuggestion: ReportInspectResponse['statusSuggestion']): string {
  switch (statusSuggestion) {
    case 'FLAGGED':
      return 'Thanks for the report. We will check it carefully before using it.';
    case 'REVIEW_REQUIRED':
      return 'Thanks for the report. It needs a short review before it can help the price data.';
    default:
      return 'Thanks for the report. It has been prepared for normal review.';
  }
}

function actionForVerdict(verdict: Verdict, productCode: string): AgentActionDisplay {
  switch (verdict) {
    case 'CHEAP':
      return { label: `${productCode} (LOW)`, description: 'Confirm quality and unit before buying.' };
    case 'FAIR':
      return { label: `${productCode} (LOW)`, description: 'The quote is within the current backend fair range.' };
    case 'EXPENSIVE':
      return { label: `${productCode} (MEDIUM)`, description: 'Consider comparing another stall or market before buying.' };
    case 'VERY_EXPENSIVE':
      return { label: `${productCode} (HIGH)`, description: 'Compare alternatives before buying.' };
  }
}

function priorityFromAction(action: AgentActionDisplay): AgentPriority {
  if (action.label?.includes('HIGH')) {
    return 'HIGH';
  }
  if (action.label?.includes('LOW')) {
    return 'LOW';
  }
  return 'MEDIUM';
}

function bestProductMatch(normalizedInput: string): { product: ProductResponse; score: number } | null {
  const matches = mockProducts.map((product) => ({ product, score: scoreProduct(product, normalizedInput) }));
  return matches.reduce<{ product: ProductResponse; score: number } | null>(
    (best, match) => (!best || match.score > best.score ? match : best),
    null,
  );
}

function scoreProduct(product: ProductResponse, normalizedInput: string): number {
  const inputTokens = meaningfulTokens(normalizedInput);
  if (inputTokens.size === 0) {
    return 0;
  }
  const terms = [
    product.code,
    product.nameEn,
    product.nameKo,
    product.nameUz,
    product.nameRu,
    ...product.aliases.map((alias) => alias.alias),
  ];
  let bestScore = 0;
  for (const term of terms) {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) {
      continue;
    }
    if (normalizedInput === normalizedTerm) {
      return 100;
    }
    const termTokens = meaningfulTokens(normalizedTerm);
    const overlap = tokenOverlap(inputTokens, termTokens);
    if (overlap === 0) {
      continue;
    }
    const inputContainsTerm = phraseContains(normalizedInput, normalizedTerm);
    const termContainsInput = phraseContains(normalizedTerm, normalizedInput);
    if (inputContainsTerm && termTokens.size === 1) {
      bestScore = Math.max(bestScore, 86);
    } else if (inputContainsTerm || termContainsInput) {
      const requiredOverlap = Math.min(2, Math.min(inputTokens.size, termTokens.size));
      if (overlap >= requiredOverlap) {
        bestScore = Math.max(bestScore, 88);
      }
    } else if (overlap >= 2) {
      bestScore = Math.max(bestScore, 76);
    } else if (overlap === 1) {
      bestScore = Math.max(bestScore, 55);
    }
  }
  return bestScore;
}

function matchedAliases(product: ProductResponse, normalizedInput: string): string[] {
  const inputTokens = meaningfulTokens(normalizedInput);
  return product.aliases
    .map((alias) => alias.alias)
    .filter((alias) => {
      const normalizedAlias = normalizeText(alias);
      return (
        normalizedAlias === normalizedInput ||
        phraseContains(normalizedInput, normalizedAlias) ||
        tokenOverlap(inputTokens, meaningfulTokens(normalizedAlias)) > 0
      );
    });
}

function confidenceForScore(score: number): number {
  if (score >= 100) return 0.95;
  if (score >= 85) return 0.88;
  if (score >= 70) return 0.78;
  if (score > 0) return 0.55;
  return 0.2;
}

function variantFor(normalizedInput: string): string {
  const pink = normalizedInput.includes('pink');
  const red = normalizedInput.includes('red');
  const greenhouse = normalizedInput.includes('greenhouse');
  if (pink && greenhouse) return 'PINK_GREENHOUSE';
  if (red && greenhouse) return 'RED_GREENHOUSE';
  if (normalizedInput.includes('cherry')) return 'CHERRY';
  if (normalizedInput.includes('local')) return 'LOCAL';
  if (greenhouse) return 'GREENHOUSE';
  if (pink) return 'PINK_GREENHOUSE';
  if (red) return 'RED_GREENHOUSE';
  return 'STANDARD';
}

function phraseContains(text: string, phrase: string): boolean {
  const phraseTokens = meaningfulTokens(phrase);
  if (phraseTokens.size === 0) {
    return false;
  }
  if (phraseTokens.size === 1) {
    return meaningfulTokens(text).has([...phraseTokens][0]);
  }
  return tokenOverlap(new Set(text.split(' ')), phraseTokens) === phraseTokens.size;
}

function tokenOverlap(left: Set<string>, right: Set<string>): number {
  let overlap = 0;
  for (const token of right) {
    if (left.has(token)) {
      overlap += 1;
    }
  }
  return overlap;
}

function meaningfulTokens(value: string): Set<string> {
  return new Set(value.split(' ').filter((token) => token && !genericTokens.has(token)));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['`]/g, '')
    .replace(/[^\p{L}\p{Nd}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 80));
}

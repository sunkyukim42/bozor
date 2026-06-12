import type { Verdict } from '@/src/api/apiTypes';
import {
  asArray,
  asBoolean,
  asDateString,
  asNumber,
  asRecord,
  asString,
  normalizeSourceBreakdown,
} from '@/src/api/adapters/commonAdapter';
import type {
  AgentActionDisplay,
  AgentPriority,
  AgentRiskLevel,
  AgentSafetyFlags,
  AgentStatusSuggestion,
  FieldSurveyPlanResponse,
  MarketBriefingHighlight,
  MarketBriefingResponse,
  PriceInsightResponse,
  ProductNormalizeResponse,
  ReportInspectResponse,
  SourceSummary,
  SuggestedAction,
  SurveyTarget,
} from '@/src/api/agentTypes';

const verdicts: Verdict[] = ['CHEAP', 'FAIR', 'EXPENSIVE', 'VERY_EXPENSIVE'];
const riskLevels: AgentRiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
const statusSuggestions: AgentStatusSuggestion[] = ['PENDING', 'REVIEW_REQUIRED', 'FLAGGED', 'REJECT_CANDIDATE'];
const priorities: AgentPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

export const defaultAgentSafetyFlags: AgentSafetyFlags = {
  usedOnlyBackendPrices: true,
  noSellerBlaming: true,
  noAiGeneratedFairPrice: true,
  difyConnected: false,
  noAutoApproval: true,
};

export function adaptProductNormalize(value: unknown): ProductNormalizeResponse {
  const record = asRecord(value);
  const standardProductCode = optionalString(record.standardProductCode);
  return {
    rawProductName: optionalString(record.rawProductName),
    standardProductCode: standardProductCode ?? null,
    standardProductName: optionalString(record.standardProductName) ?? null,
    variant: optionalString(record.variant) ?? 'UNKNOWN',
    matchConfidence: asNumber(record.matchConfidence, standardProductCode ? 0.7 : 0.2),
    needsHumanReview: asBoolean(record.needsHumanReview, !standardProductCode),
    matchedAliases: asArray(record.matchedAliases)
      .map((item) => asString(item).trim())
      .filter(Boolean),
    explanation: asString(record.explanation, standardProductCode ? 'Matched backend catalog data.' : 'No reliable product match found.'),
  };
}

export function adaptReportInspect(value: unknown): ReportInspectResponse {
  const record = asRecord(value);
  const statusSuggestion = adaptStatusSuggestion(record.statusSuggestion);
  return {
    normalizedProductCode: optionalString(record.normalizedProductCode) ?? null,
    riskLevel: adaptRiskLevel(record.riskLevel),
    statusSuggestion,
    needsHumanReview: asBoolean(record.needsHumanReview, statusSuggestion !== 'PENDING'),
    anomalyReasons: asStringArray(record.anomalyReasons),
    reviewNote: asString(record.reviewNote, 'Keep this report in the manual review queue.'),
    userMessage: asString(record.userMessage, 'Thanks for the report. It will be reviewed before use.'),
    sourceSummary: adaptOptionalSourceSummary(record.sourceSummary),
    safetyFlags: adaptSafetyFlags(record.safetyFlags),
  };
}

export function adaptPriceInsight(value: unknown): PriceInsightResponse {
  const record = asRecord(value);
  const detail = adaptOptionalSourceSummary(record.sourceSummary);
  const action = adaptOptionalSuggestedAction(record.recommendedAction);
  return {
    productCode: asString(record.productCode, detail?.productCode ?? ''),
    marketCode: asString(record.marketCode, detail?.marketCode ?? ''),
    quotedPrice: asNumber(record.quotedPrice),
    unitCode: asString(record.unitCode, 'KG'),
    fairLow: optionalNumber(record.fairLow),
    fairMid: optionalNumber(record.fairMid),
    fairHigh: optionalNumber(record.fairHigh),
    recommendedTargetPrice: optionalNumber(record.recommendedTargetPrice),
    overFairHighPercent: optionalNumber(record.overFairHighPercent),
    backendVerdict: adaptVerdict(record.backendVerdict ?? record.verdict),
    insightText: asString(record.insightText, 'Backend price data was checked.'),
    confidenceExplanation: asString(
      record.confidenceExplanation,
      'This insight explains stored BozorCheck summaries and does not generate fair prices.',
    ),
    sourceSummary: asString(record.sourceSummaryText, sourceSummaryText(detail)),
    sourceSummaryDetail: detail,
    recommendedAction: asString(record.recommendedActionText, suggestedActionText(action)),
    recommendedActionDetail: action,
    optionalBargainPhrase: optionalString(record.optionalBargainPhrase ?? record.bargainPhrase),
    safetyFlags: adaptSafetyFlags(record.safetyFlags),
  };
}

export function adaptMarketBriefing(value: unknown): MarketBriefingResponse {
  const record = asRecord(value);
  return {
    marketCode: optionalString(record.marketCode),
    marketName: optionalString(record.marketName),
    summaryDate: optionalDateString(record.summaryDate),
    briefingTitle: asString(record.briefingTitle, 'Market briefing'),
    summaryText: asString(record.summaryText, 'Backend market data is available for review.'),
    highlights: adaptHighlights(record.highlights),
    dataWarnings: asStringArray(record.dataWarnings),
    recommendedActions: adaptActionDisplays(record.recommendedActions),
    sourceSummary: adaptOptionalSourceSummary(record.sourceSummary),
  };
}

export function adaptFieldSurveyPlan(value: unknown): FieldSurveyPlanResponse {
  const record = asRecord(value);
  const targets = adaptSurveyTargets(record.todaySurveyTargets);
  const surveyTargets = adaptSurveyTargets(record.surveyTargets);
  return {
    marketCode: optionalString(record.marketCode),
    summaryDate: optionalDateString(record.summaryDate),
    todaySurveyTargets: targets,
    recommendedPlan: asString(
      record.recommendedPlan,
      targets.length > 0 ? 'Collect additional field observations for the listed products.' : 'Keep monitoring normal reports.',
    ),
    recommendedActions: adaptActionDisplays(record.recommendedActions),
    surveyTargets: surveyTargets.length > 0 ? surveyTargets : targets,
    dataWarnings: asStringArray(record.dataWarnings),
  };
}

export function adaptSourceSummary(value: unknown): SourceSummary {
  const record = asRecord(value);
  return {
    productCode: optionalString(record.productCode),
    marketCode: optionalString(record.marketCode),
    summaryDate: optionalDateString(record.summaryDate),
    sampleCount: optionalNumber(record.sampleCount),
    confidenceScore: optionalNumber(record.confidenceScore),
    sourceBreakdown: normalizeSourceBreakdown(record.sourceBreakdown),
    surveyDate: optionalDateString(record.surveyDate),
    location: optionalString(record.location),
    dataSource: optionalString(record.dataSource),
    dataNote: optionalString(record.dataNote),
  };
}

export function adaptSafetyFlags(value: unknown): AgentSafetyFlags {
  const record = asRecord(value);
  return {
    usedOnlyBackendPrices: asBoolean(record.usedOnlyBackendPrices, defaultAgentSafetyFlags.usedOnlyBackendPrices),
    noSellerBlaming: asBoolean(record.noSellerBlaming, defaultAgentSafetyFlags.noSellerBlaming),
    noAiGeneratedFairPrice: asBoolean(record.noAiGeneratedFairPrice, defaultAgentSafetyFlags.noAiGeneratedFairPrice),
    difyConnected: asBoolean(record.difyConnected, defaultAgentSafetyFlags.difyConnected),
    noAutoApproval: asBoolean(record.noAutoApproval, defaultAgentSafetyFlags.noAutoApproval),
  };
}

export function sourceSummaryText(summary?: SourceSummary): string {
  if (!summary) {
    return 'Backend source summary unavailable.';
  }
  const parts = [
    summary.productCode && summary.marketCode ? `${summary.productCode} at ${summary.marketCode}` : null,
    summary.summaryDate ? `date ${summary.summaryDate}` : null,
    typeof summary.sampleCount === 'number' ? `${summary.sampleCount} sample(s)` : null,
    typeof summary.confidenceScore === 'number' ? `${Math.round(summary.confidenceScore * 100)}% confidence` : null,
    summary.dataSource ? `source ${summary.dataSource}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : 'Backend source summary unavailable.';
}

export function suggestedActionText(action?: SuggestedAction): string {
  if (!action) {
    return 'Use this as supporting guidance and compare with backend price data.';
  }
  return action.message ?? action.reason ?? 'Use this as supporting guidance and compare with backend price data.';
}

function adaptOptionalSourceSummary(value: unknown): SourceSummary | undefined {
  if (!value) {
    return undefined;
  }
  const summary = adaptSourceSummary(value);
  return hasSourceSummaryContent(summary) ? summary : undefined;
}

function adaptOptionalSuggestedAction(value: unknown): SuggestedAction | undefined {
  if (!value) {
    return undefined;
  }
  const record = asRecord(value);
  const action = {
    productCode: optionalString(record.productCode),
    priority: adaptPriority(record.priority),
    reason: optionalString(record.reason),
    message: optionalString(record.message),
  };
  return action.productCode || action.reason || action.message ? action : undefined;
}

function adaptActionDisplays(value: unknown): AgentActionDisplay[] {
  const displays: AgentActionDisplay[] = [];
  for (const item of asArray(value)) {
    if (typeof item === 'string') {
      displays.push({ description: item });
      continue;
    }
    const action = adaptOptionalSuggestedAction(item);
    if (action) {
      displays.push({
        label: action.productCode ? `${action.productCode}${action.priority ? ` (${action.priority})` : ''}` : action.priority,
        description: action.message ?? action.reason,
      });
    }
  }
  return displays;
}

function adaptHighlights(value: unknown): MarketBriefingHighlight[] {
  return asArray(value)
    .map((item) => {
      if (typeof item === 'string') {
        return { message: item };
      }
      const record = asRecord(item);
      const message = asString(record.message);
      return message ? { productCode: optionalString(record.productCode), message } : null;
    })
    .filter((item): item is MarketBriefingHighlight => item !== null);
}

function adaptSurveyTargets(value: unknown): SurveyTarget[] {
  const targets: SurveyTarget[] = [];
  for (const item of asArray(value)) {
    const record = asRecord(item);
    const productCode = asString(record.productCode).trim();
    if (productCode) {
      targets.push({
        productCode,
        priority: adaptPriority(record.priority),
        reason: asString(record.reason, 'Needs additional field data.'),
        message: optionalString(record.message),
      });
    }
  }
  return targets;
}

function asStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => asString(item).trim())
    .filter(Boolean);
}

function hasSourceSummaryContent(summary: SourceSummary): boolean {
  return Boolean(
    summary.productCode ||
      summary.marketCode ||
      summary.summaryDate ||
      summary.sampleCount ||
      summary.confidenceScore ||
      summary.surveyDate ||
      summary.dataSource ||
      Object.keys(summary.sourceBreakdown ?? {}).length > 0,
  );
}

function adaptVerdict(value: unknown): Verdict {
  const candidate = asString(value) as Verdict;
  return verdicts.includes(candidate) ? candidate : 'FAIR';
}

function adaptRiskLevel(value: unknown): AgentRiskLevel {
  const candidate = asString(value) as AgentRiskLevel;
  return riskLevels.includes(candidate) ? candidate : 'LOW';
}

function adaptStatusSuggestion(value: unknown): AgentStatusSuggestion {
  const candidate = asString(value) as AgentStatusSuggestion;
  return statusSuggestions.includes(candidate) ? candidate : 'PENDING';
}

function adaptPriority(value: unknown): AgentPriority {
  const candidate = asString(value) as AgentPriority;
  return priorities.includes(candidate) ? candidate : 'MEDIUM';
}

function optionalString(value: unknown): string | undefined {
  const text = asString(value).trim();
  return text.length > 0 ? text : undefined;
}

function optionalDateString(value: unknown): string | undefined {
  const text = asDateString(value);
  return text.length > 0 ? text : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

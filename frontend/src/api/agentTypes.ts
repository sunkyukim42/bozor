import type { Verdict } from '@/src/api/apiTypes';

export type AgentRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type AgentStatusSuggestion = 'PENDING' | 'REVIEW_REQUIRED' | 'FLAGGED' | 'REJECT_CANDIDATE';

export type AgentPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ProductNormalizeRequest = {
  rawProductName: string;
  locale?: string;
  marketCode?: string;
};

export type ProductNormalizeResponse = {
  rawProductName?: string;
  standardProductCode: string | null;
  standardProductName: string | null;
  variant: string | null;
  matchConfidence: number;
  needsHumanReview: boolean;
  matchedAliases: string[];
  explanation: string;
};

export type ReportInspectRequest = {
  rawProductName?: string;
  productCode?: string;
  marketCode: string;
  submittedPrice: number;
  submittedUnit: string;
  locale?: string;
};

export type ReportInspectResponse = {
  normalizedProductCode: string | null;
  riskLevel: AgentRiskLevel;
  statusSuggestion: AgentStatusSuggestion;
  needsHumanReview: boolean;
  anomalyReasons: string[];
  reviewNote: string;
  userMessage: string;
  sourceSummary?: SourceSummary;
  safetyFlags?: AgentSafetyFlags;
};

export type PriceInsightRequest = {
  productCode: string;
  marketCode: string;
  quotedPrice: number;
  unitCode: string;
  locale?: string;
  includeOptionalPhrase?: boolean;
  includeBargainPhrase?: boolean;
};

export type PriceInsightResponse = {
  productCode: string;
  marketCode: string;
  quotedPrice: number;
  unitCode: string;
  fairLow?: number;
  fairMid?: number;
  fairHigh?: number;
  recommendedTargetPrice?: number;
  overFairHighPercent?: number;
  backendVerdict: Verdict;
  insightText: string;
  confidenceExplanation: string;
  sourceSummary: string;
  sourceSummaryDetail?: SourceSummary;
  recommendedAction: string;
  recommendedActionDetail?: SuggestedAction;
  optionalBargainPhrase?: string | null;
  safetyFlags: AgentSafetyFlags;
};

export type MarketBriefingRequest = {
  marketCode: string;
  summaryDate?: string;
  date?: string;
  locale?: string;
};

export type MarketBriefingHighlight = {
  productCode?: string;
  message: string;
};

export type AgentActionDisplay = {
  label?: string;
  description?: string;
};

export type MarketBriefingResponse = {
  marketCode?: string;
  marketName?: string;
  summaryDate?: string;
  briefingTitle: string;
  summaryText: string;
  highlights: MarketBriefingHighlight[];
  dataWarnings: string[];
  recommendedActions: AgentActionDisplay[];
  sourceSummary?: SourceSummary;
};

export type FieldSurveyPlanRequest = {
  marketCode: string;
  summaryDate?: string;
  date?: string;
  locale?: string;
};

export type SurveyTarget = {
  productCode: string;
  priority: AgentPriority;
  reason: string;
  message?: string;
};

export type FieldSurveyPlanResponse = {
  marketCode?: string;
  summaryDate?: string;
  todaySurveyTargets: SurveyTarget[];
  recommendedPlan: string;
  recommendedActions?: AgentActionDisplay[];
  surveyTargets?: SurveyTarget[];
  dataWarnings?: string[];
};

export type AgentSafetyFlags = {
  usedOnlyBackendPrices?: boolean;
  noSellerBlaming?: boolean;
  noAiGeneratedFairPrice?: boolean;
  difyConnected?: boolean;
  noAutoApproval?: boolean;
};

export type SourceSummary = {
  productCode?: string;
  marketCode?: string;
  summaryDate?: string;
  sampleCount?: number;
  confidenceScore?: number;
  sourceBreakdown?: Record<string, number>;
  surveyDate?: string;
  location?: string;
  dataSource?: string;
  dataNote?: string;
};

export type SuggestedAction = {
  productCode?: string | null;
  priority?: AgentPriority;
  reason?: string;
  message?: string;
};

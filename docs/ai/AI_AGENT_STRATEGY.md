# BozorCheck AI Agent Strategy

## Direction Shift

Translation-first or bargaining-phrase AI is weakly differentiated from Google Translate, Papago, or built-in phone translation apps. BozorCheck AI should be centered on transparent price data, product standardization, trustworthy report review, and market comparison.

AI must not invent fair prices. Prices are calculated by the Spring/backend pricing system. Dify should help normalize, inspect, explain, and summarize messy market data.

## Core Principles

- Prices are calculated by Spring/backend, not Dify.
- Dify explains, normalizes, inspects, and summarizes.
- No AI-generated fair price.
- No automatic approval of reports.
- No seller-blaming wording.
- Data confidence and source transparency first.

## Recommended Dify Agents

### Agent 1: Product Normalizer

Role: normalize product names, aliases, languages, and varieties into a standard product code and optional variant.

Example: `pink greenhouse pomidor` -> `TOMATO / PINK_GREENHOUSE`

Input:
- `rawProductName`
- `locale`
- optional `market`
- product aliases

Output:
- `standardProductCode`
- `variant`
- `matchConfidence`
- `needsHumanReview`

### Agent 2: Report Inspector

Role: inspect user price reports and flag anomalies or administrator review needs.

Input:
- `submittedPrice`
- `unit`
- `productCode`
- `marketCode`
- `recentFairLow`
- `recentFairMid`
- `recentFairHigh`
- `confidenceScore`

Output:
- `riskLevel`
- `statusSuggestion`
- `needsHumanReview`
- `anomalyReasons`
- `reviewNote`

Principle: AI does not confirm `APPROVED`. It only recommends `PENDING`, `FLAGGED`, or `REVIEW_REQUIRED`.

### Agent 3: Price Insight Explainer

Role: explain backend price verdicts, sources, confidence, and market comparisons in user-friendly language.

Input:
- `backendVerdict`
- `fairLow`
- `fairMid`
- `fairHigh`
- `quotedPrice`
- `confidenceScore`
- `sampleCount`
- `sourceBreakdown`
- market comparison

Output:
- `insightText`
- `confidenceExplanation`
- `sourceSummary`
- `recommendedAction`

Bargaining phrases can exist only as optional helper text, not as the main output.

### Agent 4: Market Briefing

Role: create a daily market summary for Home or presentation views.

Input:
- `marketCode`
- `surveyDate`
- product summaries
- Chorsu/Korzinka comparison

Output:
- `briefingTitle`
- `summaryText`
- `highlights`
- `dataWarnings`
- `recommendedActions`

### Agent 5: Field Survey Planner

Role: recommend which products and markets need more field survey coverage.

Input:
- `sampleCount`
- `confidenceScore`
- `lastObservedAt`
- market coverage

Output:
- `todaySurveyTargets`
- `priority`
- `reason`
- `recommendedPlan`

## MVP AI Scope

Priority for MVP planning:

1. Product Normalizer
2. Report Inspector
3. Price Insight Explainer

Market Briefing is useful for presentation and Home screen refinement. Field Survey Planner is useful for operations maturity after the basic reporting loop is stable.

## Revenue Connection

- Consumers get free price transparency.
- Sellers can pay for Fair Seller Badge, store profiles, or promoted products.
- Restaurants and small businesses can subscribe to price reports and buying insights.
- Long term, BozorCheck can support B2B wholesale matching and data report/API products.
- AI contributes to revenue through data cleaning, review support, trust scoring, and report automation, not through translation.

## Summary for Dify Designers

- `Price Insight Explainer` is more accurate than `Price Coach`.
- `bargainPhrases` should be optional helper output, not the main product.
- Product Normalizer and Report Inspector are more central to the service than phrase generation.
- Dify belongs inside the data pipeline as a normalization, inspection, and explanation layer.

## Local Data Use

- The 2026-06-05 Chorsu/Korzinka field survey is used as mock/demo data in the frontend.
- Product standardization names and multilingual labels should become Product Normalizer knowledge.
- The Telegram/social finding should guide report/alert channel strategy. Telegram is not an automatic price source.

## Phase Notes

- The current frontend uses mock data only.
- Phase 4 should move local survey data into backend seed/test data.
- A future Dify Knowledge Base can include product standardization, multilingual labels, UI/copy guidance, and Telegram/social findings.

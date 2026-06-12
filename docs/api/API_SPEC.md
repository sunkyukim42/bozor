# BozorCheck API Spec

Base URL: `http://localhost:8080`

Swagger UI: `/swagger-ui/index.html`

All normal success responses use:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

All errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": {}
  }
}
```

## Security Notes

Admin APIs under `/api/v1/admin/**` are MVP development endpoints and currently have no authentication. Authentication is required before production use.

Dify integration is intentionally not implemented in this phase. It is planned for a later AI integration phase.
The Phase 5A agent endpoints use deterministic mock providers only. They do not call Dify, OpenAI,
Telegram, or any external service, and they do not auto-approve user reports.

## Public APIs

### `GET /api/v1/products`

Query params: `query`, `active` default `true`, `locale` default `en`.

Returns active products by default. When `query` is present, searches code, localized names, and product aliases case-insensitively.

### `GET /api/v1/products/{productId}`

Returns one product with aliases. Missing product returns `PRODUCT_NOT_FOUND`.

### `GET /api/v1/markets`

Query params: `type`, `active` default `true`, `city`.

Returns markets, online retailers, and national-average entries.

### `GET /api/v1/markets/{marketId}`

Returns one market. Missing market returns `MARKET_NOT_FOUND`.

### `GET /api/v1/prices/summary`

Query params: `productCode` required, `marketCode` default `TASHKENT_CHORSU`, `date`.

Returns the requested DAILY summary if `date` is present, otherwise the latest DAILY summary.

Phase 4 local seed data includes `2026-06-05` survey-backed summaries for `TASHKENT_CHORSU` and
`KORZINKA_ONLINE`. Summary responses include optional metadata when backed by survey/reference rows:

```json
{
  "productCode": "RICE",
  "marketCode": "TASHKENT_CHORSU",
  "summaryDate": "2026-06-05",
  "fairLow": 14300,
  "fairMid": 15000,
  "fairHigh": 15800,
  "sampleCount": 1,
  "confidenceScore": 0.58,
  "sourceBreakdown": {
    "FIELD_SURVEY": 1
  },
  "surveyDate": "2026-06-05",
  "location": "Chorsu Bazaar and Korzinka, Tashkent",
  "dataSource": "FIELD_SURVEY",
  "dataNote": "Field survey/reference data for real API development; not live pricing."
}
```

### `GET /api/v1/prices/history`

Query params: `productCode` required, `marketCode` default `TASHKENT_CHORSU`, `from`, `to`, `grain` default `DAILY`.

Returns summaries ordered by `summaryDate` ascending. Without `from` and `to`, the API uses the latest 30-day window.

### `POST /api/v1/prices/check`

```json
{
  "productCode": "TOMATO",
  "marketCode": "TASHKENT_CHORSU",
  "quotedPrice": 22000,
  "unitCode": "KG"
}
```

Returns deterministic verdict `CHEAP`, `FAIR`, `EXPENSIVE`, or `VERY_EXPENSIVE`. No AI or Dify call is made.
The response also includes `sampleCount`, `sourceBreakdown`, and optional survey metadata when available.

### `POST /api/v1/agent/product-normalize`

Normalizes a raw product phrase against active backend products and aliases. The mock provider ranks exact
alias/name/code matches above partial token matches.

Request:

```json
{
  "rawProductName": "pink greenhouse pomidor",
  "locale": "en"
}
```

Success response:

```json
{
  "rawProductName": "pink greenhouse pomidor",
  "standardProductCode": "TOMATO",
  "standardProductName": "Tomato",
  "variant": "PINK_GREENHOUSE",
  "matchConfidence": 0.88,
  "needsHumanReview": false,
  "matchedAliases": ["pink tomato", "greenhouse tomato", "pomidor"],
  "explanation": "Matched backend product aliases or meaningful name tokens."
}
```

Unknown product response:

```json
{
  "rawProductName": "unknown local vegetable",
  "standardProductCode": null,
  "standardProductName": null,
  "variant": "UNKNOWN",
  "matchConfidence": 0.20,
  "needsHumanReview": true,
  "matchedAliases": [],
  "explanation": "No reliable product alias match was found in backend catalog data."
}
```

### `POST /api/v1/agent/report-inspect`

Inspects a submitted report candidate without creating or updating any report row. The mock provider only
suggests `PENDING`, `FLAGGED`, `REVIEW_REQUIRED`, or `REJECT_CANDIDATE`; it never suggests `APPROVED`.

Request:

```json
{
  "productCode": "RICE",
  "marketCode": "TASHKENT_CHORSU",
  "submittedPrice": 18000,
  "submittedUnit": "KG",
  "locale": "en"
}
```

Success response:

```json
{
  "normalizedProductCode": "RICE",
  "riskLevel": "MEDIUM",
  "statusSuggestion": "REVIEW_REQUIRED",
  "needsHumanReview": true,
  "anomalyReasons": ["Submitted price is above backend fair high."],
  "reviewNote": "Review manually because the submitted value is outside the fair range.",
  "userMessage": "Thanks for the report. It needs a short review before it can help the price data.",
  "sourceSummary": {
    "productCode": "RICE",
    "marketCode": "TASHKENT_CHORSU",
    "summaryDate": "2026-06-05",
    "sampleCount": 1,
    "confidenceScore": 0.58,
    "sourceBreakdown": {
      "FIELD_SURVEY": 1
    },
    "surveyDate": "2026-06-05",
    "location": "Chorsu Bazaar and Korzinka, Tashkent",
    "dataSource": "FIELD_SURVEY",
    "dataNote": "Field survey/reference data for real API development; not live pricing."
  },
  "safetyFlags": {
    "usedOnlyBackendPrices": true,
    "noSellerBlaming": true,
    "noAiGeneratedFairPrice": true,
    "difyConnected": false,
    "noAutoApproval": true
  }
}
```

### `POST /api/v1/agent/price-insight`

Explains an existing backend price verdict. Fair range and verdict are copied from `POST /api/v1/prices/check`;
the agent does not generate prices.

Request. `includeOptionalPhrase` is the primary contract field; `includeBargainPhrase` is still accepted as a
backward-compatible alias.

```json
{
  "productCode": "RICE",
  "marketCode": "TASHKENT_CHORSU",
  "quotedPrice": 18000,
  "unitCode": "KG",
  "includeOptionalPhrase": true
}
```

Success response:

```json
{
  "productCode": "RICE",
  "marketCode": "TASHKENT_CHORSU",
  "quotedPrice": 18000,
  "unitCode": "KG",
  "fairLow": 14300,
  "fairMid": 15000,
  "fairHigh": 15800,
  "verdict": "EXPENSIVE",
  "recommendedTargetPrice": 15000,
  "overFairHighPercent": 13.92,
  "insightText": "Backend price check returned EXPENSIVE for RICE. The fair range is 14300.00-15800.00 KG based on stored BozorCheck summaries.",
  "confidenceExplanation": "Confidence is 0.580 from 1 backend sample(s); the agent did not generate a fair price.",
  "sourceSummary": {
    "productCode": "RICE",
    "marketCode": "TASHKENT_CHORSU",
    "sampleCount": 1,
    "confidenceScore": 0.58,
    "sourceBreakdown": {
      "FIELD_SURVEY": 1
    },
    "surveyDate": "2026-06-05",
    "location": "Chorsu Bazaar and Korzinka, Tashkent",
    "dataSource": "FIELD_SURVEY",
    "dataNote": "Field survey/reference data for real API development; not live pricing."
  },
  "recommendedAction": {
    "productCode": "RICE",
    "priority": "MEDIUM",
    "reason": "Above backend fair high.",
    "message": "Consider comparing another stall or market before buying."
  },
  "bargainPhrase": "Could you offer a price closer to 15000.00 KG?",
  "safetyFlags": {
    "usedOnlyBackendPrices": true,
    "noSellerBlaming": true,
    "noAiGeneratedFairPrice": true,
    "difyConnected": false,
    "noAutoApproval": true
  }
}
```

### `POST /api/v1/agent/market-briefing`

Summarizes market/date price summaries using stored backend data.

Request. `summaryDate` is the primary contract field; `date` is accepted as a backward-compatible alias.

```json
{
  "marketCode": "TASHKENT_CHORSU",
  "summaryDate": "2026-06-05"
}
```

Success response:

```json
{
  "marketCode": "TASHKENT_CHORSU",
  "marketName": "Chorsu Bazaar",
  "summaryDate": "2026-06-05",
  "briefingTitle": "2026-06-05 Chorsu Bazaar price briefing",
  "summaryText": "Chorsu Bazaar has 10 backend price summaries for this date. The briefing uses stored survey/reference data only.",
  "highlights": [
    "APPLE fair midpoint is 40000.00 at Chorsu Bazaar."
  ],
  "dataWarnings": [
    "Field survey/reference data has low sample counts and development-level confidence."
  ],
  "recommendedActions": [
    {
      "productCode": "APPLE",
      "priority": "HIGH",
      "reason": "Low sample count or development confidence.",
      "message": "Collect additional field observations for APPLE."
    }
  ]
}
```

### `POST /api/v1/agent/field-survey-plan`

Builds deterministic survey targets from summary coverage, sample count, and confidence. Missing summaries,
`sampleCount < 3`, or low confidence increase priority.

Request. `summaryDate` is the primary contract field; `date` is accepted as a backward-compatible alias.

```json
{
  "marketCode": "TASHKENT_CHORSU",
  "summaryDate": "2026-06-05"
}
```

Success response:

```json
{
  "marketCode": "TASHKENT_CHORSU",
  "summaryDate": "2026-06-05",
  "todaySurveyTargets": [
    {
      "productCode": "RICE",
      "priority": "HIGH",
      "reason": "Very low sample count or confidence.",
      "message": "Collect at least three fresh observations for RICE."
    }
  ],
  "recommendedPlan": "Collect at least 3 observations for RICE at Chorsu Bazaar. Prioritize products with low sample count or low confidence score.",
  "surveyTargets": [
    {
      "productCode": "RICE",
      "priority": "HIGH",
      "reason": "Very low sample count or confidence.",
      "message": "Collect at least three fresh observations for RICE."
    }
  ],
  "recommendedActions": [
    {
      "productCode": "RICE",
      "priority": "HIGH",
      "reason": "Very low sample count or confidence.",
      "message": "Prioritize RICE during the next field survey."
    }
  ],
  "dataWarnings": [
    "Survey plan is based on backend summary coverage and confidence only."
  ]
}
```

`todaySurveyTargets` and `recommendedPlan` are the primary contract fields. `surveyTargets` is retained as a
backward-compatible alias for `todaySurveyTargets`; `recommendedActions` retains the structured action list.

Phase 5A provider swap note: future real Dify providers can implement the same provider interfaces, but secrets
and external calls are intentionally absent from this backend phase. Any future Dify API key must be managed only
as a backend secret and must not be committed to source, docs, or `.http` files.

### `POST /api/v1/reports`

Optional header: `X-Anonymous-Key`.

```json
{
  "productCode": "TOMATO",
  "marketCode": "TASHKENT_CHORSU",
  "rawProductName": "pomidor",
  "submittedPrice": 16000,
  "submittedUnit": "KG",
  "photoUrl": null,
  "latitude": 41.3265,
  "longitude": 69.2286
}
```

Creates a `PENDING` report. If `X-Anonymous-Key` is provided, only its SHA-256 hash is stored.

For unit-specific products, use the product default unit. Examples: `KG` for `RICE`, `PCS_10` for `EGGS`,
and `LITER` for `VEGETABLE_OIL`.

## Phase 4 Local Survey Seed

The backend seed contains real-API development rows for `2026-06-05`; these are field survey/reference
data, not guaranteed live prices. Added products are:

- `RICE`
- `EGGS`
- `VEGETABLE_OIL`
- `BEEF`

Search aliases include `rice`, `guruch`, `tuxum`, and `mol go'shti`. Korzinka rice stores the original
`13,490 UZS / 900g` reference in `raw_payload` and exposes the 1kg normalized fair band. Korzinka tomato
keeps the Red/Pink greenhouse range note.

## Admin APIs

### `POST /api/v1/admin/products`

Creates a product and optional aliases.

### `PATCH /api/v1/admin/products/{productId}`

Updates names, unit, seasonal flag, active flag, and optionally replaces aliases.

### `POST /api/v1/admin/markets`

Creates a market. `marketType` must be `BAZAAR`, `SUPERMARKET`, `ONLINE_RETAIL`, or `NATIONAL_AVERAGE`.

### `PATCH /api/v1/admin/markets/{marketId}`

Updates market metadata.

### `POST /api/v1/admin/price-observations`

```json
{
  "productCode": "TOMATO",
  "marketCode": "TASHKENT_CHORSU",
  "sourceCode": "FIELD_SURVEY",
  "observedAt": "2026-05-30T10:00:00+09:00",
  "priceAmount": 16000,
  "currency": "UZS",
  "unitCode": "KG",
  "normalizedPricePerKg": 16000,
  "qualityGrade": "STANDARD",
  "status": "APPROVED",
  "trustScore": 0.8,
  "rawPayload": {
    "note": "manual field survey"
  }
}
```

Creates a price observation.

### `GET /api/v1/admin/price-observations`

Query params: `productCode`, `marketCode`, `sourceCode`, `status`, `from`, `to`, `page`, `size`.

Returns a paged response ordered by `observedAt desc`.

### `GET /api/v1/admin/reports`

Query params: `status`, `marketCode`, `productCode`, `page`, `size`.

Returns a paged response ordered by `submittedAt desc`.

### `POST /api/v1/admin/reports/{reportId}/approve`

```json
{
  "sourceCode": "USER_REPORT",
  "trustScore": 0.6,
  "qualityGrade": "STANDARD",
  "normalizedPricePerKg": 16000,
  "reviewNote": "Looks valid from photo and location."
}
```

Approves a `PENDING` or `FLAGGED` report, creates a normalized `price_observations` row, and links it to the report. Re-approving an approved report returns `INVALID_STATUS_TRANSITION`.

### `POST /api/v1/admin/reports/{reportId}/reject`

```json
{
  "reviewNote": "Price is not readable from photo."
}
```

Marks a report as `REJECTED`.

### `POST /api/v1/admin/price-summaries/recompute`

```json
{
  "productCode": "TOMATO",
  "marketCode": "TASHKENT_CHORSU",
  "summaryDate": "2026-05-30",
  "summaryGrain": "DAILY"
}
```

Recomputes a DAILY summary from approved observations for the given product, market, and date. It inserts a new summary or updates the existing one.

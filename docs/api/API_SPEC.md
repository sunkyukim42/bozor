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

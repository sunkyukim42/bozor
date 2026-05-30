# BozorCheck Data Dictionary

## product_categories

- `id`: UUID primary key.
- `code`: Stable category code, unique.
- `name_ko`, `name_en`, `name_uz`, `name_ru`: Localized display names.
- `sort_order`: Display ordering hint.
- `created_at`, `updated_at`: Audit timestamps.

## products

- `id`: UUID primary key.
- `category_id`: Parent category.
- `code`: Stable product code, unique.
- `name_ko`, `name_en`, `name_uz`, `name_ru`: Localized display names.
- `default_unit`: Default measurement unit, currently `KG`.
- `is_seasonal`: Whether seasonality strongly affects the product.
- `active`: Whether the product is exposed to application logic.

## product_aliases

- `id`: UUID primary key.
- `product_id`: Product referenced by the alias.
- `locale`: Alias locale, for example `en`, `ko`, `uz`, or `ru`.
- `alias`: Search or ingestion alias.
- Unique key: `product_id`, `locale`, `alias`.

## markets

- `id`: UUID primary key.
- `code`: Stable market code, unique.
- `name`, `city`, `district`, `address`: Location metadata.
- `latitude`, `longitude`: Optional coordinates.
- `market_type`: `BAZAAR`, `SUPERMARKET`, `ONLINE_RETAIL`, or `NATIONAL_AVERAGE`.
- `active`: Whether the market is currently usable.

## data_sources

- `id`: UUID primary key.
- `code`: Stable source code, unique.
- `name`: Human readable source name.
- `source_type`: `OFFICIAL_STAT`, `MARKET_SURVEY`, `USER_REPORT`, `ONLINE_RETAIL`, or `ADMIN_SEED`.
- `base_url`: Optional upstream URL.
- `default_trust_weight`: Default trust value between 0 and 1.
- `requires_manual_review`: Whether observations from this source need review.
- `active`: Whether the source is currently usable.

## app_users

- `id`: UUID primary key.
- `anonymous_key_hash`: Optional anonymous user key hash, unique.
- `preferred_locale`: Locale used for user-facing responses.
- `created_at`, `last_seen_at`: User lifecycle timestamps.

## price_observations

- `id`: UUID primary key.
- `product_id`, `market_id`, `source_id`: Normalized observation dimensions.
- `observed_at`: Time the price was observed.
- `price_amount`: Submitted or collected price in `currency`.
- `currency`: ISO currency code, default `UZS`.
- `unit_code`: Observed unit, default `KG`.
- `normalized_price_per_kg`: Required comparable kilogram price.
- `quality_grade`: `UNKNOWN`, `ECONOMY`, `STANDARD`, `PREMIUM`, `SMALL`, or `LARGE`.
- `status`: `PENDING`, `APPROVED`, `REJECTED`, or `FLAGGED`.
- `trust_score`: Source-specific confidence between 0 and 1.
- `raw_payload`: JSONB metadata from ingestion or review.

## price_reports

- `id`: UUID primary key.
- `reporter_id`: Optional anonymous app user.
- `product_id`: Optional normalized product.
- `market_id`: Reported market.
- `raw_product_name`: User-entered product text before normalization.
- `submitted_price`, `submitted_unit`: Raw report values.
- `photo_url`, `latitude`, `longitude`: Optional supporting evidence.
- `submitted_at`: Submission timestamp.
- `status`, `review_note`: Review workflow fields.
- `normalized_observation_id`: Optional approved observation created from the report.

## price_summaries

- `id`: UUID primary key.
- `product_id`, `market_id`, `summary_date`, `summary_grain`: Unique summary dimensions.
- `fair_low`, `fair_mid`, `fair_high`: Fair price band.
- `min_price`, `max_price`: Optional observed range.
- `sample_count`: Number of observations used.
- `confidence_score`: Confidence between 0 and 1.
- `source_breakdown`: JSONB contribution summary by source type.
- `computed_at`: Time this summary was computed.

## price_anomalies

- `id`: UUID primary key.
- `observation_id`: Flagged price observation.
- `anomaly_type`: `OUTLIER_HIGH`, `OUTLIER_LOW`, `SUSPICIOUS_REPORT`, or `DUPLICATE`.
- `severity`: `LOW`, `MEDIUM`, or `HIGH`.
- `reason`: Human or automated explanation.
- `detected_at`, `resolved_at`, `created_at`: Anomaly lifecycle timestamps.

## agent_conversations

- `id`: UUID primary key.
- `app_user_id`: Optional app user owner.
- `external_conversation_id`: Future Dify conversation identifier.
- `locale`: Conversation locale.
- `created_at`: Creation timestamp.

## agent_messages

- `id`: UUID primary key.
- `conversation_id`: Parent conversation.
- `role`: `USER`, `ASSISTANT`, or `SYSTEM`.
- `content`: Message content.
- `product_id`, `market_id`, `quoted_price`: Optional extracted context.
- `dify_message_id`: Future Dify message identifier.
- `raw_payload`: JSONB provider payload.

## ingestion_jobs

- `id`: UUID primary key.
- `source_id`: Source being imported.
- `job_type`: `STAT_IMPORT`, `CSV_IMPORT`, `SCRAPING`, or `MANUAL_SEED`.
- `status`: `READY`, `RUNNING`, `SUCCESS`, `FAILED`, or `PARTIAL_SUCCESS`.
- `started_at`, `finished_at`: Runtime timestamps.
- `total_count`, `success_count`, `failed_count`: Import counters.
- `error_message`: Failure details.

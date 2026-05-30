# Database Decisions

## PostgreSQL

PostgreSQL is the primary database because this service needs reliable relational constraints, numeric precision for prices, JSONB for raw ingestion payloads, and mature indexing support.

## UUID Primary Keys

All main tables use UUID primary keys. This keeps identifiers opaque, avoids sequence coordination concerns, and works well for future ingestion pipelines that may create data outside a single application process. PostgreSQL `gen_random_uuid()` is enabled through `pgcrypto` in the first Flyway migration.

## Reports vs Observations

`price_reports` stores raw user submissions and review state. `price_observations` stores normalized, queryable price facts. Keeping them separate prevents unreviewed user input from being treated as approved market data while still preserving the original report.

## Price Summaries

`price_summaries` is a separate read model for fair price bands. It avoids recalculating low, mid, high, confidence, and source breakdown values on every price lookup.

## Dify Integration

Dify API calls are intentionally not implemented in this phase. `agent_conversations` and `agent_messages` only reserve storage for future conversation logs and provider identifiers.

## JSONB Mapping

JSONB fields are mapped with Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)` and `Map<String, Object>`, while columns still declare `columnDefinition = "jsonb"`. This keeps Java access structured without hand-parsing strings and documents the PostgreSQL column type clearly in the entity.

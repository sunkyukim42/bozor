# BozorCheck Database ERD

```mermaid
erDiagram
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : categorizes
    PRODUCTS ||--o{ PRODUCT_ALIASES : has
    PRODUCTS ||--o{ PRICE_OBSERVATIONS : observed_for
    MARKETS ||--o{ PRICE_OBSERVATIONS : observed_at
    DATA_SOURCES ||--o{ PRICE_OBSERVATIONS : provides
    APP_USERS ||--o{ PRICE_REPORTS : submits
    PRODUCTS ||--o{ PRICE_REPORTS : reported_as
    MARKETS ||--o{ PRICE_REPORTS : reported_at
    PRICE_OBSERVATIONS ||--o| PRICE_REPORTS : normalizes
    PRODUCTS ||--o{ PRICE_SUMMARIES : summarized_for
    MARKETS ||--o{ PRICE_SUMMARIES : summarized_at
    PRICE_OBSERVATIONS ||--o{ PRICE_ANOMALIES : flagged_by
    APP_USERS ||--o{ AGENT_CONVERSATIONS : owns
    AGENT_CONVERSATIONS ||--o{ AGENT_MESSAGES : contains
    PRODUCTS ||--o{ AGENT_MESSAGES : mentions
    MARKETS ||--o{ AGENT_MESSAGES : mentions
    DATA_SOURCES ||--o{ INGESTION_JOBS : runs

    PRODUCT_CATEGORIES {
        uuid id PK
        varchar code UK
        varchar name_ko
        varchar name_en
    }
    PRODUCTS {
        uuid id PK
        uuid category_id FK
        varchar code UK
        varchar default_unit
    }
    PRODUCT_ALIASES {
        uuid id PK
        uuid product_id FK
        varchar locale
        varchar alias
    }
    MARKETS {
        uuid id PK
        varchar code UK
        varchar market_type
    }
    DATA_SOURCES {
        uuid id PK
        varchar code UK
        varchar source_type
    }
    APP_USERS {
        uuid id PK
        varchar anonymous_key_hash UK
    }
    PRICE_OBSERVATIONS {
        uuid id PK
        uuid product_id FK
        uuid market_id FK
        uuid source_id FK
        numeric normalized_price_per_kg
        jsonb raw_payload
    }
    PRICE_REPORTS {
        uuid id PK
        uuid reporter_id FK
        uuid product_id FK
        uuid market_id FK
        uuid normalized_observation_id FK
    }
    PRICE_SUMMARIES {
        uuid id PK
        uuid product_id FK
        uuid market_id FK
        date summary_date
        numeric fair_mid
        jsonb source_breakdown
    }
    PRICE_ANOMALIES {
        uuid id PK
        uuid observation_id FK
        varchar anomaly_type
    }
    AGENT_CONVERSATIONS {
        uuid id PK
        uuid app_user_id FK
    }
    AGENT_MESSAGES {
        uuid id PK
        uuid conversation_id FK
        varchar role
        jsonb raw_payload
    }
    INGESTION_JOBS {
        uuid id PK
        uuid source_id FK
        varchar job_type
        varchar status
    }
```

## Core Flow

- Master data defines products, markets, and data sources.
- User submitted prices are stored in `price_reports` first.
- Reviewed and normalized prices are stored in `price_observations`.
- Read-optimized fair price bands are stored in `price_summaries`.
- Future Dify chat logs can be stored in `agent_conversations` and `agent_messages` without adding API integration in this phase.

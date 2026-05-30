create extension if not exists pgcrypto;

create table product_categories (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) unique not null,
    name_ko varchar(100) not null,
    name_en varchar(100) not null,
    name_uz varchar(100),
    name_ru varchar(100),
    sort_order int default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references product_categories(id),
    code varchar(60) unique not null,
    name_ko varchar(100) not null,
    name_en varchar(100) not null,
    name_uz varchar(100),
    name_ru varchar(100),
    default_unit varchar(16) not null default 'KG',
    is_seasonal boolean not null default false,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table product_aliases (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete cascade,
    locale varchar(20) not null,
    alias varchar(120) not null,
    created_at timestamptz not null default now(),
    unique (product_id, locale, alias)
);

create table markets (
    id uuid primary key default gen_random_uuid(),
    code varchar(60) unique not null,
    name varchar(150) not null,
    city varchar(100),
    district varchar(100),
    address varchar(255),
    latitude numeric(10,7),
    longitude numeric(10,7),
    market_type varchar(30) not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (market_type in ('BAZAAR', 'SUPERMARKET', 'ONLINE_RETAIL', 'NATIONAL_AVERAGE'))
);

create table data_sources (
    id uuid primary key default gen_random_uuid(),
    code varchar(60) unique not null,
    name varchar(150) not null,
    source_type varchar(30) not null,
    base_url text,
    default_trust_weight numeric(4,3) not null default 0.500,
    requires_manual_review boolean not null default false,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (default_trust_weight between 0 and 1),
    check (source_type in ('OFFICIAL_STAT', 'MARKET_SURVEY', 'USER_REPORT', 'ONLINE_RETAIL', 'ADMIN_SEED'))
);

create table app_users (
    id uuid primary key default gen_random_uuid(),
    anonymous_key_hash varchar(128) unique,
    preferred_locale varchar(10) not null default 'en',
    created_at timestamptz not null default now(),
    last_seen_at timestamptz
);

create table price_observations (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id),
    market_id uuid not null references markets(id),
    source_id uuid not null references data_sources(id),
    observed_at timestamptz not null,
    price_amount numeric(12,2) not null,
    currency varchar(3) not null default 'UZS',
    unit_code varchar(16) not null default 'KG',
    normalized_price_per_kg numeric(12,2) not null,
    quality_grade varchar(30) not null default 'UNKNOWN',
    status varchar(30) not null default 'APPROVED',
    trust_score numeric(4,3) not null default 0.500,
    raw_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (price_amount > 0),
    check (normalized_price_per_kg > 0),
    check (trust_score between 0 and 1),
    check (quality_grade in ('UNKNOWN', 'ECONOMY', 'STANDARD', 'PREMIUM', 'SMALL', 'LARGE')),
    check (status in ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'))
);

create table price_reports (
    id uuid primary key default gen_random_uuid(),
    reporter_id uuid references app_users(id),
    product_id uuid references products(id),
    market_id uuid not null references markets(id),
    raw_product_name varchar(150),
    submitted_price numeric(12,2) not null,
    submitted_unit varchar(16) not null default 'KG',
    photo_url text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    submitted_at timestamptz not null default now(),
    status varchar(30) not null default 'PENDING',
    review_note text,
    normalized_observation_id uuid unique references price_observations(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (submitted_price > 0),
    check (status in ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'))
);

create table price_summaries (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id),
    market_id uuid not null references markets(id),
    summary_date date not null,
    summary_grain varchar(20) not null default 'DAILY',
    fair_low numeric(12,2) not null,
    fair_mid numeric(12,2) not null,
    fair_high numeric(12,2) not null,
    min_price numeric(12,2),
    max_price numeric(12,2),
    sample_count int not null default 0,
    confidence_score numeric(4,3) not null default 0.000,
    source_breakdown jsonb not null default '{}'::jsonb,
    computed_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (product_id, market_id, summary_date, summary_grain),
    check (fair_low > 0),
    check (fair_mid > 0),
    check (fair_high > 0),
    check (fair_low <= fair_mid),
    check (fair_mid <= fair_high),
    check (sample_count >= 0),
    check (confidence_score between 0 and 1),
    check (summary_grain in ('DAILY', 'WEEKLY', 'MONTHLY'))
);

create table price_anomalies (
    id uuid primary key default gen_random_uuid(),
    observation_id uuid not null references price_observations(id) on delete cascade,
    anomaly_type varchar(40) not null,
    severity varchar(20) not null,
    reason text,
    detected_at timestamptz not null default now(),
    resolved_at timestamptz,
    created_at timestamptz not null default now(),
    check (anomaly_type in ('OUTLIER_HIGH', 'OUTLIER_LOW', 'SUSPICIOUS_REPORT', 'DUPLICATE')),
    check (severity in ('LOW', 'MEDIUM', 'HIGH'))
);

create table agent_conversations (
    id uuid primary key default gen_random_uuid(),
    app_user_id uuid references app_users(id),
    external_conversation_id varchar(120),
    locale varchar(10) not null default 'en',
    created_at timestamptz not null default now()
);

create table agent_messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references agent_conversations(id) on delete cascade,
    role varchar(20) not null,
    content text not null,
    product_id uuid references products(id),
    market_id uuid references markets(id),
    quoted_price numeric(12,2),
    dify_message_id varchar(120),
    raw_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    check (role in ('USER', 'ASSISTANT', 'SYSTEM')),
    check (quoted_price is null or quoted_price > 0)
);

create table ingestion_jobs (
    id uuid primary key default gen_random_uuid(),
    source_id uuid not null references data_sources(id),
    job_type varchar(40) not null,
    status varchar(30) not null default 'READY',
    started_at timestamptz,
    finished_at timestamptz,
    total_count int not null default 0,
    success_count int not null default 0,
    failed_count int not null default 0,
    error_message text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (job_type in ('STAT_IMPORT', 'CSV_IMPORT', 'SCRAPING', 'MANUAL_SEED')),
    check (status in ('READY', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS')),
    check (total_count >= 0),
    check (success_count >= 0),
    check (failed_count >= 0)
);

create index idx_products_code on products(code);
create index idx_product_aliases_alias on product_aliases(alias);
create index idx_markets_code on markets(code);
create index idx_data_sources_code on data_sources(code);
create index idx_price_observations_product_market_observed_at
    on price_observations(product_id, market_id, observed_at desc);
create index idx_price_observations_source_observed_at
    on price_observations(source_id, observed_at desc);
create index idx_price_observations_status on price_observations(status);
create index idx_price_reports_status_submitted_at on price_reports(status, submitted_at desc);
create index idx_price_summaries_product_market_summary_date
    on price_summaries(product_id, market_id, summary_date desc);
create index idx_agent_messages_conversation_created_at on agent_messages(conversation_id, created_at);
create index idx_ingestion_jobs_source_created_at on ingestion_jobs(source_id, created_at desc);

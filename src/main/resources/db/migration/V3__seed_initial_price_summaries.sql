with observation_groups as (
    select
        product_id,
        market_id,
        observed_at::date as summary_date,
        count(*) as sample_count,
        min(normalized_price_per_kg) as min_price,
        max(normalized_price_per_kg) as max_price,
        percentile_cont(0.25) within group (order by normalized_price_per_kg)::numeric(12,2) as fair_low,
        percentile_cont(0.50) within group (order by normalized_price_per_kg)::numeric(12,2) as fair_mid,
        percentile_cont(0.75) within group (order by normalized_price_per_kg)::numeric(12,2) as fair_high
    from price_observations
    where status = 'APPROVED'
    group by product_id, market_id, observed_at::date
),
source_counts as (
    select
        po.product_id,
        po.market_id,
        po.observed_at::date as summary_date,
        ds.code as source_code,
        count(*) as source_count
    from price_observations po
    join data_sources ds on ds.id = po.source_id
    where po.status = 'APPROVED'
    group by po.product_id, po.market_id, po.observed_at::date, ds.code
),
source_breakdowns as (
    select
        product_id,
        market_id,
        summary_date,
        jsonb_object_agg(source_code, source_count) as source_breakdown,
        count(*) as distinct_source_count
    from source_counts
    group by product_id, market_id, summary_date
)
insert into price_summaries (
    product_id,
    market_id,
    summary_date,
    summary_grain,
    fair_low,
    fair_mid,
    fair_high,
    min_price,
    max_price,
    sample_count,
    confidence_score,
    source_breakdown,
    computed_at
)
select
    og.product_id,
    og.market_id,
    og.summary_date,
    'DAILY',
    og.fair_low,
    og.fair_mid,
    og.fair_high,
    og.min_price,
    og.max_price,
    og.sample_count::int,
    least(
        1.000,
        least(0.600, og.sample_count / 10.0 * 0.600)
            + least(0.250, sb.distinct_source_count / 4.0 * 0.250)
            + 0.150
    )::numeric(4,3),
    sb.source_breakdown,
    now()
from observation_groups og
join source_breakdowns sb
    on sb.product_id = og.product_id
    and sb.market_id = og.market_id
    and sb.summary_date = og.summary_date
on conflict (product_id, market_id, summary_date, summary_grain) do update set
    fair_low = excluded.fair_low,
    fair_mid = excluded.fair_mid,
    fair_high = excluded.fair_high,
    min_price = excluded.min_price,
    max_price = excluded.max_price,
    sample_count = excluded.sample_count,
    confidence_score = excluded.confidence_score,
    source_breakdown = excluded.source_breakdown,
    computed_at = excluded.computed_at,
    updated_at = now();

update price_observations po
set observed_at = timestamptz '2026-05-30 10:00:00+05',
    raw_payload = po.raw_payload || jsonb_build_object(
        'dataSource', 'DEVELOPMENT_DEMO',
        'dataNote', 'Development demo data only; not field survey data.'
    ),
    updated_at = now()
from data_sources ds
where ds.id = po.source_id
  and ds.code = 'ADMIN_SEED'
  and po.raw_payload ->> 'note' = 'development seed data only';

update price_summaries ps
set summary_date = date '2026-05-30',
    computed_at = timestamptz '2026-05-30 00:00:00+05',
    updated_at = now()
where ps.source_breakdown ? 'ADMIN_SEED'
  and not exists (
      select 1
      from price_summaries existing
      where existing.product_id = ps.product_id
        and existing.market_id = ps.market_id
        and existing.summary_date = date '2026-05-30'
        and existing.summary_grain = ps.summary_grain
        and existing.id <> ps.id
  );

insert into product_categories (code, name_ko, name_en, name_uz, name_ru, sort_order)
values
('STAPLE', 'Staple', 'Staple', 'Asosiy mahsulot', 'Bazovyi produkt', 30),
('PROTEIN', 'Protein', 'Protein', 'Oqsil mahsuloti', 'Belkovyi produkt', 40),
('OIL', 'Oil', 'Oil', 'Yog', 'Maslo', 50)
on conflict (code) do update set
    name_ko = excluded.name_ko,
    name_en = excluded.name_en,
    name_uz = excluded.name_uz,
    name_ru = excluded.name_ru,
    sort_order = excluded.sort_order,
    updated_at = now();

with product_rows(category_code, code, name_ko, name_en, name_uz, name_ru, default_unit, is_seasonal) as (
    values
    ('STAPLE', 'RICE', 'Rice', 'Rice', 'Guruch', 'Ris', 'KG', false),
    ('PROTEIN', 'EGGS', 'Eggs', 'Eggs', 'Tuxum', 'Yaytsa', 'PCS_10', false),
    ('OIL', 'VEGETABLE_OIL', 'Vegetable Oil', 'Vegetable Oil', 'O''simlik yog''i', 'Rastitelnoe maslo', 'LITER', false),
    ('PROTEIN', 'BEEF', 'Beef', 'Beef', 'Mol go''shti', 'Govyadina', 'KG', false)
)
insert into products (category_id, code, name_ko, name_en, name_uz, name_ru, default_unit, is_seasonal, active)
select pc.id, pr.code, pr.name_ko, pr.name_en, pr.name_uz, pr.name_ru, pr.default_unit, pr.is_seasonal, true
from product_rows pr
join product_categories pc on pc.code = pr.category_code
on conflict (code) do update set
    category_id = excluded.category_id,
    name_ko = excluded.name_ko,
    name_en = excluded.name_en,
    name_uz = excluded.name_uz,
    name_ru = excluded.name_ru,
    default_unit = excluded.default_unit,
    is_seasonal = excluded.is_seasonal,
    active = true,
    updated_at = now();

insert into data_sources (code, name, source_type, base_url, default_trust_weight, requires_manual_review, active)
values
('KORZINKA_REFERENCE', 'Korzinka reference price', 'ONLINE_RETAIL', null, 0.550, false, true)
on conflict (code) do update set
    name = excluded.name,
    source_type = excluded.source_type,
    base_url = excluded.base_url,
    default_trust_weight = excluded.default_trust_weight,
    requires_manual_review = excluded.requires_manual_review,
    active = true,
    updated_at = now();

with alias_rows(product_code, locale, alias) as (
    values
    ('TOMATO', 'en', 'tomato'),
    ('TOMATO', 'uz', 'pomidor'),
    ('TOMATO', 'standard', 'pink tomato'),
    ('TOMATO', 'standard', 'red tomato'),
    ('TOMATO', 'standard', 'greenhouse tomato'),
    ('TOMATO', 'standard', 'local tomato'),
    ('TOMATO', 'standard', 'cherry tomato'),
    ('CUCUMBER', 'en', 'cucumber'),
    ('CUCUMBER', 'uz', 'bodring'),
    ('CUCUMBER', 'standard', 'greenhouse cucumber'),
    ('CUCUMBER', 'standard', 'local cucumber'),
    ('CARROT', 'en', 'carrot'),
    ('CARROT', 'uz', 'sabzi'),
    ('CARROT', 'standard', 'red carrot'),
    ('CARROT', 'standard', 'yellow carrot'),
    ('CARROT', 'standard', 'local carrot'),
    ('POTATO', 'en', 'potato'),
    ('POTATO', 'uz', 'kartoshka'),
    ('POTATO', 'standard', 'local potato'),
    ('POTATO', 'standard', 'russian potato'),
    ('ONION', 'en', 'onion'),
    ('ONION', 'uz', 'piyoz'),
    ('ONION', 'standard', 'white onion'),
    ('ONION', 'standard', 'red onion'),
    ('APPLE', 'en', 'apple'),
    ('APPLE', 'uz', 'olma'),
    ('APPLE', 'standard', 'green apple'),
    ('APPLE', 'standard', 'red apple'),
    ('APPLE', 'standard', 'golden apple'),
    ('APPLE', 'standard', 'imported apple'),
    ('RICE', 'en', 'rice'),
    ('RICE', 'uz', 'guruch'),
    ('RICE', 'ru', 'ris'),
    ('RICE', 'standard', 'alanga rice'),
    ('RICE', 'standard', 'laser rice'),
    ('EGGS', 'en', 'eggs'),
    ('EGGS', 'en', 'egg'),
    ('EGGS', 'uz', 'tuxum'),
    ('EGGS', 'ru', 'yaytsa'),
    ('EGGS', 'standard', 'farm eggs'),
    ('EGGS', 'standard', 'factory eggs'),
    ('VEGETABLE_OIL', 'en', 'vegetable oil'),
    ('VEGETABLE_OIL', 'en', 'oil'),
    ('VEGETABLE_OIL', 'uz', 'o''simlik yog''i'),
    ('VEGETABLE_OIL', 'uz', 'osimlik yogi'),
    ('VEGETABLE_OIL', 'standard', 'cottonseed oil'),
    ('VEGETABLE_OIL', 'standard', 'sunflower oil'),
    ('BEEF', 'en', 'beef'),
    ('BEEF', 'uz', 'mol go''shti'),
    ('BEEF', 'uz', 'mol goshti'),
    ('BEEF', 'ru', 'govyadina'),
    ('BEEF', 'standard', 'boneless beef'),
    ('BEEF', 'standard', 'beef with bone')
)
insert into product_aliases (product_id, locale, alias)
select p.id, ar.locale, ar.alias
from alias_rows ar
join products p on p.code = ar.product_code
on conflict (product_id, locale, alias) do nothing;

with survey_rows(
    product_code,
    market_code,
    source_code,
    observed_at,
    price_amount,
    unit_code,
    normalized_price_per_kg,
    trust_score,
    data_note,
    original_unit,
    normalized_note
) as (
    values
    ('TOMATO', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:00:00+05', 10000.00, 'KG', 10000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('CUCUMBER', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:05:00+05', 10000.00, 'KG', 10000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('CARROT', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:10:00+05', 9000.00, 'KG', 9000.00, 0.580, 'Chorsu field survey range was 8,000-10,000 UZS/kg.', 'KG', 'Fair range preserves the provided field survey range.'),
    ('POTATO', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:15:00+05', 8000.00, 'KG', 8000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('ONION', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:20:00+05', 5000.00, 'KG', 5000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('APPLE', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:25:00+05', 40000.00, 'KG', 40000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('RICE', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:30:00+05', 15000.00, 'KG', 15000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('EGGS', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:35:00+05', 16000.00, 'PCS_10', 16000.00, 0.580, 'Chorsu field survey range was 15,000-17,000 UZS per 10 pcs.', 'PCS_10', 'MVP schema stores normalized_price_per_kg even for non-KG units; value represents price per 10 pcs for EGGS.'),
    ('VEGETABLE_OIL', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:40:00+05', 19000.00, 'LITER', 19000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'LITER', 'MVP schema stores normalized_price_per_kg even for non-KG units; value represents price per liter for VEGETABLE_OIL.'),
    ('BEEF', 'TASHKENT_CHORSU', 'FIELD_SURVEY', timestamptz '2026-06-05 10:45:00+05', 95000.00, 'KG', 95000.00, 0.580, 'Field survey/reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('TOMATO', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:00:00+05', 10490.00, 'KG', 10490.00, 0.550, 'Korzinka reference listed Red Greenhouse at 7,990 UZS/kg and Pink Greenhouse at 12,990 UZS/kg.', 'KG', 'Fair range preserves the Red/Pink greenhouse reference range.'),
    ('CUCUMBER', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:05:00+05', 8000.00, 'KG', 8000.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('CARROT', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:10:00+05', 6990.00, 'KG', 6990.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('POTATO', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:15:00+05', 7950.00, 'KG', 7950.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('ONION', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:20:00+05', 3990.00, 'KG', 3990.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('APPLE', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:25:00+05', 34990.00, 'KG', 34990.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.'),
    ('RICE', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:30:00+05', 13490.00, 'KG', 14989.00, 0.550, 'Korzinka reference was 13,490 UZS for 900g; normalized to about 14,989 UZS/kg.', '900G', '13,490 UZS / 0.9kg = about 14,989 UZS/kg.'),
    ('EGGS', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:35:00+05', 22490.00, 'PCS_10', 22490.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'PCS_10', 'MVP schema stores normalized_price_per_kg even for non-KG units; value represents price per 10 pcs for EGGS.'),
    ('VEGETABLE_OIL', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:40:00+05', 20890.00, 'LITER', 20890.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'LITER', 'MVP schema stores normalized_price_per_kg even for non-KG units; value represents price per liter for VEGETABLE_OIL.'),
    ('BEEF', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', timestamptz '2026-06-05 12:45:00+05', 99990.00, 'KG', 99990.00, 0.550, 'Korzinka reference data for real API development; not live pricing.', 'KG', 'Price observed per kg.')
)
insert into price_observations (
    product_id,
    market_id,
    source_id,
    observed_at,
    price_amount,
    currency,
    unit_code,
    normalized_price_per_kg,
    quality_grade,
    status,
    trust_score,
    raw_payload
)
select
    p.id,
    m.id,
    ds.id,
    sr.observed_at,
    sr.price_amount,
    'UZS',
    sr.unit_code,
    sr.normalized_price_per_kg,
    'STANDARD',
    'APPROVED',
    sr.trust_score,
    jsonb_build_object(
        'surveyDate', '2026-06-05',
        'location', 'Chorsu Bazaar and Korzinka, Tashkent',
        'dataSource', sr.source_code,
        'dataNote', sr.data_note,
        'originalUnit', sr.original_unit,
        'normalizedNote', sr.normalized_note
    )
from survey_rows sr
join products p on p.code = sr.product_code
join markets m on m.code = sr.market_code
join data_sources ds on ds.code = sr.source_code
where not exists (
    select 1
    from price_observations existing
    join data_sources existing_source on existing_source.id = existing.source_id
    where existing.product_id = p.id
      and existing.market_id = m.id
      and existing_source.code = sr.source_code
      and existing.observed_at = sr.observed_at
      and existing.raw_payload ->> 'surveyDate' = '2026-06-05'
);

with summary_rows(
    product_code,
    market_code,
    source_code,
    fair_low,
    fair_mid,
    fair_high,
    min_price,
    max_price,
    confidence_score
) as (
    values
    ('TOMATO', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 9500.00, 10000.00, 10500.00, 9500.00, 10500.00, 0.580),
    ('CUCUMBER', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 9500.00, 10000.00, 10500.00, 9500.00, 10500.00, 0.580),
    ('CARROT', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 8000.00, 9000.00, 10000.00, 8000.00, 10000.00, 0.580),
    ('POTATO', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 7600.00, 8000.00, 8400.00, 7600.00, 8400.00, 0.580),
    ('ONION', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 4800.00, 5000.00, 5300.00, 4800.00, 5300.00, 0.580),
    ('APPLE', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 38000.00, 40000.00, 42000.00, 38000.00, 42000.00, 0.580),
    ('RICE', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 14300.00, 15000.00, 15800.00, 14300.00, 15800.00, 0.580),
    ('EGGS', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 15000.00, 16000.00, 17000.00, 15000.00, 17000.00, 0.580),
    ('VEGETABLE_OIL', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 18100.00, 19000.00, 20000.00, 18100.00, 20000.00, 0.580),
    ('BEEF', 'TASHKENT_CHORSU', 'FIELD_SURVEY', 90300.00, 95000.00, 99800.00, 90300.00, 99800.00, 0.580),
    ('TOMATO', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 7990.00, 10490.00, 12990.00, 7990.00, 12990.00, 0.550),
    ('CUCUMBER', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 7600.00, 8000.00, 8400.00, 7600.00, 8400.00, 0.550),
    ('CARROT', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 6600.00, 6990.00, 7300.00, 6600.00, 7300.00, 0.550),
    ('POTATO', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 7600.00, 7950.00, 8300.00, 7600.00, 8300.00, 0.550),
    ('ONION', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 3800.00, 3990.00, 4200.00, 3800.00, 4200.00, 0.550),
    ('APPLE', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 33200.00, 34990.00, 36700.00, 33200.00, 36700.00, 0.550),
    ('RICE', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 14200.00, 14989.00, 15700.00, 14200.00, 15700.00, 0.550),
    ('EGGS', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 21400.00, 22490.00, 23600.00, 21400.00, 23600.00, 0.550),
    ('VEGETABLE_OIL', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 19800.00, 20890.00, 21900.00, 19800.00, 21900.00, 0.550),
    ('BEEF', 'KORZINKA_ONLINE', 'KORZINKA_REFERENCE', 95000.00, 99990.00, 105000.00, 95000.00, 105000.00, 0.550)
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
    p.id,
    m.id,
    date '2026-06-05',
    'DAILY',
    sr.fair_low,
    sr.fair_mid,
    sr.fair_high,
    sr.min_price,
    sr.max_price,
    1,
    sr.confidence_score,
    jsonb_build_object(sr.source_code, 1),
    timestamptz '2026-06-05 00:00:00+05'
from summary_rows sr
join products p on p.code = sr.product_code
join markets m on m.code = sr.market_code
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

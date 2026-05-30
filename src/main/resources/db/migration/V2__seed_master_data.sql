insert into product_categories (code, name_ko, name_en, name_uz, name_ru, sort_order) values
('VEGETABLE', 'Vegetable', 'Vegetable', 'Sabzavot', 'Ovoschi', 10),
('FRUIT', 'Fruit', 'Fruit', 'Meva', 'Frukty', 20);

insert into products (category_id, code, name_ko, name_en, name_uz, name_ru, default_unit, is_seasonal, active) values
((select id from product_categories where code = 'VEGETABLE'), 'TOMATO', 'Tomato', 'Tomato', 'Pomidor', 'Pomidor', 'KG', true, true),
((select id from product_categories where code = 'VEGETABLE'), 'CUCUMBER', 'Cucumber', 'Cucumber', 'Bodring', 'Ogurets', 'KG', true, true),
((select id from product_categories where code = 'VEGETABLE'), 'POTATO', 'Potato', 'Potato', 'Kartoshka', 'Kartofel', 'KG', false, true),
((select id from product_categories where code = 'VEGETABLE'), 'ONION', 'Onion', 'Onion', 'Piyoz', 'Luk', 'KG', false, true),
((select id from product_categories where code = 'VEGETABLE'), 'CARROT', 'Carrot', 'Carrot', 'Sabzi', 'Morkov', 'KG', false, true),
((select id from product_categories where code = 'VEGETABLE'), 'CABBAGE', 'Cabbage', 'Cabbage', 'Karam', 'Kapusta', 'KG', false, true),
((select id from product_categories where code = 'VEGETABLE'), 'EGGPLANT', 'Eggplant', 'Eggplant', 'Baqlajon', 'Baklazhan', 'KG', true, true),
((select id from product_categories where code = 'VEGETABLE'), 'BELL_PEPPER', 'Bell pepper', 'Bell pepper', 'Bolgor qalampiri', 'Bolgarskii perets', 'KG', true, true),
((select id from product_categories where code = 'FRUIT'), 'APPLE', 'Apple', 'Apple', 'Olma', 'Yabloko', 'KG', false, true),
((select id from product_categories where code = 'FRUIT'), 'MELON', 'Melon', 'Melon', 'Qovun', 'Dynya', 'KG', true, true);

insert into markets (code, name, city, district, address, latitude, longitude, market_type, active) values
('UZBEKISTAN_NATIONAL', 'Uzbekistan national average', null, null, null, null, null, 'NATIONAL_AVERAGE', true),
('TASHKENT_CHORSU', 'Chorsu Bazaar', 'Tashkent', 'Shaykhontohur', 'Chorsu Bazaar area', 41.3260000, 69.2340000, 'BAZAAR', true),
('TASHKENT_ALAY', 'Alay Bazaar', 'Tashkent', 'Yunusabad', 'Alay Bazaar area', 41.3150000, 69.2850000, 'BAZAAR', true),
('KORZINKA_ONLINE', 'Korzinka online', 'Tashkent', null, null, null, null, 'ONLINE_RETAIL', true),
('MAKRO_ONLINE', 'Makro online', 'Tashkent', null, null, null, null, 'ONLINE_RETAIL', true);

insert into data_sources (code, name, source_type, base_url, default_trust_weight, requires_manual_review, active) values
('STAT_UZ', 'Statistics Agency of Uzbekistan', 'OFFICIAL_STAT', 'https://stat.uz', 0.900, false, true),
('FIELD_SURVEY', 'Field survey', 'MARKET_SURVEY', null, 0.800, false, true),
('USER_REPORT', 'User report', 'USER_REPORT', null, 0.500, true, true),
('KORZINKA', 'Korzinka online retail', 'ONLINE_RETAIL', null, 0.700, false, true),
('MAKRO', 'Makro online retail', 'ONLINE_RETAIL', null, 0.700, false, true),
('ADMIN_SEED', 'Administrator seed data', 'ADMIN_SEED', null, 0.300, false, true);

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
) values
((select id from products where code = 'TOMATO'), (select id from markets where code = 'TASHKENT_CHORSU'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 12000.00, 'UZS', 'KG', 12000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'CUCUMBER'), (select id from markets where code = 'TASHKENT_CHORSU'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 9000.00, 'UZS', 'KG', 9000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'POTATO'), (select id from markets where code = 'UZBEKISTAN_NATIONAL'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 6000.00, 'UZS', 'KG', 6000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'ONION'), (select id from markets where code = 'UZBEKISTAN_NATIONAL'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 5000.00, 'UZS', 'KG', 5000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'CARROT'), (select id from markets where code = 'TASHKENT_ALAY'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 7000.00, 'UZS', 'KG', 7000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'CABBAGE'), (select id from markets where code = 'TASHKENT_ALAY'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 5500.00, 'UZS', 'KG', 5500.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'EGGPLANT'), (select id from markets where code = 'KORZINKA_ONLINE'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 14000.00, 'UZS', 'KG', 14000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'BELL_PEPPER'), (select id from markets where code = 'KORZINKA_ONLINE'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 16000.00, 'UZS', 'KG', 16000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'APPLE'), (select id from markets where code = 'MAKRO_ONLINE'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 13000.00, 'UZS', 'KG', 13000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only')),
((select id from products where code = 'MELON'), (select id from markets where code = 'MAKRO_ONLINE'), (select id from data_sources where code = 'ADMIN_SEED'), now() - interval '1 day', 8000.00, 'UZS', 'KG', 8000.00, 'UNKNOWN', 'APPROVED', 0.300, jsonb_build_object('note', 'development seed data only'));

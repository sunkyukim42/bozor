with alias_rows(product_code, locale, alias) as (
    values
    ('TOMATO', 'ru', 'помидор'),
    ('TOMATO', 'standard', 'pink greenhouse pomidor'),
    ('TOMATO', 'standard', 'pink greenhouse tomato'),
    ('TOMATO', 'standard', 'red greenhouse pomidor'),
    ('TOMATO', 'standard', 'red greenhouse tomato'),
    ('TOMATO', 'standard', 'greenhouse pomidor')
)
insert into product_aliases (product_id, locale, alias)
select p.id, ar.locale, ar.alias
from alias_rows ar
join products p on p.code = ar.product_code
on conflict (product_id, locale, alias) do nothing;

import type { ProductAliasResponse, ProductResponse } from '@/src/api/apiTypes';
import { asArray, asBoolean, asRecord, asString } from '@/src/api/adapters/commonAdapter';

export function adaptProduct(value: unknown): ProductResponse {
  const record = asRecord(value);
  return {
    id: asString(record.id),
    code: asString(record.code),
    nameKo: asString(record.nameKo),
    nameEn: asString(record.nameEn),
    nameUz: asString(record.nameUz),
    nameRu: asString(record.nameRu),
    defaultUnit: asString(record.defaultUnit, 'KG'),
    seasonal: asBoolean(record.seasonal),
    active: asBoolean(record.active, true),
    aliases: asArray(record.aliases).map(adaptProductAlias),
  };
}

export function adaptProducts(value: unknown): ProductResponse[] {
  return asArray(value).map(adaptProduct);
}

export function productMatchesQuery(product: ProductResponse, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return [
    product.code,
    product.nameKo,
    product.nameEn,
    product.nameUz,
    product.nameRu,
    ...product.aliases.map((alias) => alias.alias),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}

function adaptProductAlias(value: unknown): ProductAliasResponse {
  const record = asRecord(value);
  return {
    locale: asString(record.locale, 'mixed'),
    alias: asString(record.alias),
  };
}

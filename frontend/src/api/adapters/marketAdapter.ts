import type { MarketResponse, MarketType } from '@/src/api/apiTypes';
import { asBoolean, asNullableString, asNumber, asRecord, asString } from '@/src/api/adapters/commonAdapter';

const marketTypes: MarketType[] = ['BAZAAR', 'SUPERMARKET', 'ONLINE_RETAIL', 'NATIONAL_AVERAGE'];

export function adaptMarket(value: unknown): MarketResponse {
  const record = asRecord(value);
  return {
    id: asString(record.id),
    code: asString(record.code),
    name: asString(record.name),
    city: asNullableString(record.city),
    district: asNullableString(record.district),
    address: asNullableString(record.address),
    latitude: record.latitude === null || record.latitude === undefined ? null : asNumber(record.latitude),
    longitude: record.longitude === null || record.longitude === undefined ? null : asNumber(record.longitude),
    marketType: adaptMarketType(record.marketType),
    active: asBoolean(record.active, true),
  };
}

export function adaptMarkets(value: unknown): MarketResponse[] {
  return Array.isArray(value) ? value.map(adaptMarket) : [];
}

function adaptMarketType(value: unknown): MarketType {
  const candidate = asString(value) as MarketType;
  return marketTypes.includes(candidate) ? candidate : 'BAZAAR';
}

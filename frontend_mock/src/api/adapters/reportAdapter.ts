import type { PriceReportResponse } from '@/src/api/apiTypes';
import {
  asNullableString,
  asNumber,
  asRecord,
  asString,
  asTimestampString,
} from '@/src/api/adapters/commonAdapter';

export function adaptPriceReport(value: unknown): PriceReportResponse {
  const record = asRecord(value);
  return {
    id: asString(record.id),
    status: 'PENDING',
    productCode: asNullableString(record.productCode),
    marketCode: asString(record.marketCode),
    rawProductName: asNullableString(record.rawProductName),
    submittedPrice: asNumber(record.submittedPrice),
    submittedUnit: asString(record.submittedUnit, 'KG'),
    normalizedObservationId: asNullableString(record.normalizedObservationId),
    reviewNote: asNullableString(record.reviewNote),
    submittedAt: asTimestampString(record.submittedAt),
  };
}

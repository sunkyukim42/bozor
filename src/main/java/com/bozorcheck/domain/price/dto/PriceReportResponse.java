package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.ReviewStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PriceReportResponse(
    UUID id,
    ReviewStatus status,
    String productCode,
    String marketCode,
    String rawProductName,
    BigDecimal submittedPrice,
    String submittedUnit,
    UUID normalizedObservationId,
    String reviewNote,
    OffsetDateTime submittedAt
) {
}

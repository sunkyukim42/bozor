package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.QualityGrade;
import com.bozorcheck.common.enums.ReviewStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record PriceObservationResponse(
    UUID id,
    String productCode,
    String marketCode,
    String sourceCode,
    OffsetDateTime observedAt,
    BigDecimal priceAmount,
    String currency,
    String unitCode,
    BigDecimal normalizedPricePerKg,
    QualityGrade qualityGrade,
    ReviewStatus status,
    BigDecimal trustScore,
    Map<String, Object> rawPayload
) {
}

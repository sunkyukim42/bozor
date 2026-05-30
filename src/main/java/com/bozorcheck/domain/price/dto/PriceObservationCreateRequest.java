package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.QualityGrade;
import com.bozorcheck.common.enums.ReviewStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

public record PriceObservationCreateRequest(
    @NotBlank @Size(max = 60) String productCode,
    @NotBlank @Size(max = 60) String marketCode,
    @NotBlank @Size(max = 60) String sourceCode,
    @NotNull OffsetDateTime observedAt,
    @NotNull @Positive BigDecimal priceAmount,
    @NotBlank @Size(min = 3, max = 3) String currency,
    @NotBlank @Size(max = 16) String unitCode,
    @NotNull @Positive BigDecimal normalizedPricePerKg,
    @NotNull QualityGrade qualityGrade,
    @NotNull ReviewStatus status,
    @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal trustScore,
    Map<String, Object> rawPayload
) {
}

package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.QualityGrade;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PriceReportApproveRequest(
    @Size(max = 60) String sourceCode,
    @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal trustScore,
    QualityGrade qualityGrade,
    @Positive BigDecimal normalizedPricePerKg,
    String reviewNote
) {
}

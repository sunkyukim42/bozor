package com.bozorcheck.domain.price.dto;

import com.bozorcheck.domain.price.PriceVerdict;
import java.math.BigDecimal;
import java.util.Map;

public record PriceCheckResponse(
    String productCode,
    String marketCode,
    BigDecimal quotedPrice,
    String unitCode,
    BigDecimal fairLow,
    BigDecimal fairMid,
    BigDecimal fairHigh,
    PriceVerdict verdict,
    BigDecimal recommendedTargetPrice,
    BigDecimal overFairHighPercent,
    BigDecimal confidenceScore,
    int sampleCount,
    Map<String, Object> sourceBreakdown,
    String surveyDate,
    String location,
    String dataSource,
    String dataNote
) {
}

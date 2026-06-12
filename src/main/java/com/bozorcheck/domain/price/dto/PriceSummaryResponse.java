package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.SummaryGrain;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

public record PriceSummaryResponse(
    String productCode,
    String productName,
    String marketCode,
    String marketName,
    LocalDate summaryDate,
    SummaryGrain summaryGrain,
    BigDecimal fairLow,
    BigDecimal fairMid,
    BigDecimal fairHigh,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    int sampleCount,
    BigDecimal confidenceScore,
    Map<String, Object> sourceBreakdown,
    OffsetDateTime computedAt,
    String surveyDate,
    String location,
    String dataSource,
    String dataNote
) {
}

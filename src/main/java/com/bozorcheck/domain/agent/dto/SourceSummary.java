package com.bozorcheck.domain.agent.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record SourceSummary(
    String productCode,
    String marketCode,
    LocalDate summaryDate,
    int sampleCount,
    BigDecimal confidenceScore,
    Map<String, Object> sourceBreakdown,
    String surveyDate,
    String location,
    String dataSource,
    String dataNote
) {
}

package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.AgentSafetyFlags;
import com.bozorcheck.domain.agent.dto.SourceSummary;
import com.bozorcheck.domain.price.dto.PriceCheckResponse;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class AgentProviderSupport {

    static final AgentSafetyFlags SAFETY_FLAGS = new AgentSafetyFlags(true, true, true, false, true);

    private AgentProviderSupport() {
    }

    static SourceSummary sourceSummary(PriceSummaryResponse summary) {
        return new SourceSummary(
            summary.productCode(),
            summary.marketCode(),
            summary.summaryDate(),
            summary.sampleCount(),
            summary.confidenceScore(),
            summary.sourceBreakdown(),
            summary.surveyDate(),
            summary.location(),
            summary.dataSource(),
            summary.dataNote()
        );
    }

    static SourceSummary sourceSummary(PriceCheckResponse response) {
        return new SourceSummary(
            response.productCode(),
            response.marketCode(),
            null,
            response.sampleCount(),
            response.confidenceScore(),
            response.sourceBreakdown(),
            response.surveyDate(),
            response.location(),
            response.dataSource(),
            response.dataNote()
        );
    }

    static SourceSummary aggregateSourceSummary(
        String marketCode,
        LocalDate summaryDate,
        List<PriceSummaryResponse> summaries
    ) {
        int totalSamples = summaries.stream().mapToInt(PriceSummaryResponse::sampleCount).sum();
        BigDecimal confidence = summaries.isEmpty()
            ? BigDecimal.ZERO.setScale(3)
            : summaries.stream()
                .map(PriceSummaryResponse::confidenceScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(summaries.size()), 3, RoundingMode.HALF_UP);
        Map<String, Object> breakdown = new LinkedHashMap<>();
        summaries.forEach(summary -> mergeBreakdown(breakdown, summary.sourceBreakdown()));
        String dataSource = summaries.stream()
            .map(PriceSummaryResponse::dataSource)
            .filter(value -> value != null && !value.isBlank())
            .distinct()
            .reduce((left, right) -> left.equals(right) ? left : "MIXED")
            .orElse(null);
        PriceSummaryResponse first = summaries.isEmpty() ? null : summaries.getFirst();
        return new SourceSummary(
            null,
            marketCode,
            summaryDate,
            totalSamples,
            confidence,
            breakdown,
            first == null ? null : first.surveyDate(),
            first == null ? null : first.location(),
            dataSource,
            first == null ? null : first.dataNote()
        );
    }

    private static void mergeBreakdown(Map<String, Object> target, Map<String, Object> source) {
        if (source == null) {
            return;
        }
        source.forEach((key, value) -> {
            int count = value instanceof Number number ? number.intValue() : 0;
            Object existing = target.get(key);
            int previous = existing instanceof Number number ? number.intValue() : 0;
            target.put(key, previous + count);
        });
    }
}

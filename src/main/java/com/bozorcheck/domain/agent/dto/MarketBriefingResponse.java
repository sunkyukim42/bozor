package com.bozorcheck.domain.agent.dto;

import java.time.LocalDate;
import java.util.List;

public record MarketBriefingResponse(
    String marketCode,
    String marketName,
    LocalDate summaryDate,
    String briefingTitle,
    String summaryText,
    List<String> highlights,
    List<String> dataWarnings,
    List<SuggestedAction> recommendedActions,
    SourceSummary sourceSummary
) {
}

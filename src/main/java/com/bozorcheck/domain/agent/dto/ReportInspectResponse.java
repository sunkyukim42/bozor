package com.bozorcheck.domain.agent.dto;

import java.util.List;

public record ReportInspectResponse(
    String normalizedProductCode,
    String riskLevel,
    String statusSuggestion,
    boolean needsHumanReview,
    List<String> anomalyReasons,
    String reviewNote,
    String userMessage,
    SourceSummary sourceSummary,
    AgentSafetyFlags safetyFlags
) {
}

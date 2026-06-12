package com.bozorcheck.domain.agent.dto;

import java.time.LocalDate;
import java.util.List;

public record FieldSurveyPlanResponse(
    String marketCode,
    LocalDate summaryDate,
    List<SuggestedAction> todaySurveyTargets,
    String recommendedPlan,
    List<SuggestedAction> surveyTargets,
    List<SuggestedAction> recommendedActions,
    List<String> dataWarnings
) {
}

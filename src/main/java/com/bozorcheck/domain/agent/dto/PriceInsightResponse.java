package com.bozorcheck.domain.agent.dto;

import com.bozorcheck.domain.price.PriceVerdict;
import java.math.BigDecimal;

public record PriceInsightResponse(
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
    String insightText,
    String confidenceExplanation,
    SourceSummary sourceSummary,
    SuggestedAction recommendedAction,
    String bargainPhrase,
    AgentSafetyFlags safetyFlags
) {
}

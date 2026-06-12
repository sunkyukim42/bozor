package com.bozorcheck.domain.agent.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductNormalizeResponse(
    String rawProductName,
    String standardProductCode,
    String standardProductName,
    String variant,
    BigDecimal matchConfidence,
    boolean needsHumanReview,
    List<String> matchedAliases,
    String explanation
) {
}

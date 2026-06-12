package com.bozorcheck.domain.agent.dto;

public record SuggestedAction(
    String productCode,
    String priority,
    String reason,
    String message
) {
}

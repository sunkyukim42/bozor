package com.bozorcheck.domain.agent.dto;

public record AgentSafetyFlags(
    boolean usedOnlyBackendPrices,
    boolean noSellerBlaming,
    boolean noAiGeneratedFairPrice,
    boolean difyConnected,
    boolean noAutoApproval
) {
}

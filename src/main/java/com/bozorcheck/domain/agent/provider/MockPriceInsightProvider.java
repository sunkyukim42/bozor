package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.PriceInsightRequest;
import com.bozorcheck.domain.agent.dto.PriceInsightResponse;
import com.bozorcheck.domain.agent.dto.SuggestedAction;
import com.bozorcheck.domain.price.PriceService;
import com.bozorcheck.domain.price.PriceVerdict;
import com.bozorcheck.domain.price.dto.PriceCheckRequest;
import com.bozorcheck.domain.price.dto.PriceCheckResponse;
import org.springframework.stereotype.Component;

@Component
public class MockPriceInsightProvider implements PriceInsightProvider {

    private final PriceService priceService;

    public MockPriceInsightProvider(PriceService priceService) {
        this.priceService = priceService;
    }

    @Override
    public PriceInsightResponse explain(PriceInsightRequest request) {
        PriceCheckResponse check = priceService.check(new PriceCheckRequest(
            request.productCode(),
            request.marketCode(),
            request.quotedPrice(),
            request.unitCode()
        ));
        SuggestedAction action = action(check.verdict(), check.productCode());
        return new PriceInsightResponse(
            check.productCode(),
            check.marketCode(),
            check.quotedPrice(),
            check.unitCode(),
            check.fairLow(),
            check.fairMid(),
            check.fairHigh(),
            check.verdict(),
            check.recommendedTargetPrice(),
            check.overFairHighPercent(),
            insightText(check),
            confidenceExplanation(check),
            AgentProviderSupport.sourceSummary(check),
            action,
            Boolean.TRUE.equals(request.includeBargainPhrase()) ? bargainPhrase(check) : null,
            AgentProviderSupport.SAFETY_FLAGS
        );
    }

    private String insightText(PriceCheckResponse check) {
        return "Backend price check returned " + check.verdict()
            + " for " + check.productCode()
            + ". The fair range is " + check.fairLow() + "-" + check.fairHigh()
            + " " + check.unitCode() + " based on stored BozorCheck summaries.";
    }

    private String confidenceExplanation(PriceCheckResponse check) {
        return "Confidence is " + check.confidenceScore()
            + " from " + check.sampleCount()
            + " backend sample(s); the agent did not generate a fair price.";
    }

    private SuggestedAction action(PriceVerdict verdict, String productCode) {
        return switch (verdict) {
            case CHEAP -> new SuggestedAction(productCode, "LOW", "Below or near backend fair low.", "Confirm quality and unit before buying.");
            case FAIR -> new SuggestedAction(productCode, "LOW", "Within backend fair range.", "The quote is within the current backend fair range.");
            case EXPENSIVE -> new SuggestedAction(productCode, "MEDIUM", "Above backend fair high.", "Consider comparing another stall or market before buying.");
            case VERY_EXPENSIVE -> new SuggestedAction(productCode, "HIGH", "More than 20% above backend fair high.", "Compare alternatives before buying.");
        };
    }

    private String bargainPhrase(PriceCheckResponse check) {
        return "Could you offer a price closer to " + check.recommendedTargetPrice() + " " + check.unitCode() + "?";
    }
}

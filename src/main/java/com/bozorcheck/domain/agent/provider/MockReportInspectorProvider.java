package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.agent.dto.ProductNormalizeRequest;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;
import com.bozorcheck.domain.agent.dto.ReportInspectRequest;
import com.bozorcheck.domain.agent.dto.ReportInspectResponse;
import com.bozorcheck.domain.price.PriceService;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class MockReportInspectorProvider implements ReportInspectorProvider {

    private static final BigDecimal HIGH_PRICE_MULTIPLIER = new BigDecimal("1.2");
    private static final BigDecimal LOW_PRICE_MULTIPLIER = new BigDecimal("0.7");

    private final ProductNormalizerProvider productNormalizerProvider;
    private final PriceService priceService;

    public MockReportInspectorProvider(
        ProductNormalizerProvider productNormalizerProvider,
        PriceService priceService
    ) {
        this.productNormalizerProvider = productNormalizerProvider;
        this.priceService = priceService;
    }

    @Override
    public ReportInspectResponse inspect(ReportInspectRequest request) {
        String productCode = resolveProductCode(request);
        if (!StringUtils.hasText(productCode)) {
            return new ReportInspectResponse(
                null,
                "HIGH",
                "REVIEW_REQUIRED",
                true,
                List.of("Product could not be normalized to an active backend product."),
                "Manual review is required before this report can be used.",
                "Thanks for the report. We need a human review because the product name was unclear.",
                null,
                AgentProviderSupport.SAFETY_FLAGS
            );
        }

        PriceSummaryResponse summary = findSummary(productCode, request.marketCode());
        if (summary == null) {
            return new ReportInspectResponse(
                productCode,
                "HIGH",
                "REVIEW_REQUIRED",
                true,
                List.of("No backend fair price summary is available for this product and market."),
                "Manual review is required because there is no reference summary.",
                "Thanks for the report. We need more backend data before using it.",
                null,
                AgentProviderSupport.SAFETY_FLAGS
            );
        }

        List<String> reasons = new ArrayList<>();
        BigDecimal highThreshold = summary.fairHigh().multiply(HIGH_PRICE_MULTIPLIER);
        BigDecimal lowThreshold = summary.fairLow().multiply(LOW_PRICE_MULTIPLIER);
        String riskLevel;
        String statusSuggestion;
        if (request.submittedPrice().compareTo(highThreshold) > 0) {
            riskLevel = "HIGH";
            statusSuggestion = "FLAGGED";
            reasons.add("Submitted price is more than 20% above backend fair high.");
        } else if (request.submittedPrice().compareTo(lowThreshold) < 0) {
            riskLevel = "HIGH";
            statusSuggestion = "FLAGGED";
            reasons.add("Submitted price is more than 30% below backend fair low.");
        } else if (request.submittedPrice().compareTo(summary.fairHigh()) > 0) {
            riskLevel = "MEDIUM";
            statusSuggestion = "REVIEW_REQUIRED";
            reasons.add("Submitted price is above backend fair high.");
        } else if (request.submittedPrice().compareTo(summary.fairLow()) < 0) {
            riskLevel = "MEDIUM";
            statusSuggestion = "REVIEW_REQUIRED";
            reasons.add("Submitted price is below backend fair low.");
        } else {
            riskLevel = "LOW";
            statusSuggestion = "PENDING";
            reasons.add("Submitted price is within the backend fair range.");
        }

        return new ReportInspectResponse(
            productCode,
            riskLevel,
            statusSuggestion,
            !"PENDING".equals(statusSuggestion),
            reasons,
            reviewNote(statusSuggestion),
            userMessage(statusSuggestion),
            AgentProviderSupport.sourceSummary(summary),
            AgentProviderSupport.SAFETY_FLAGS
        );
    }

    private String resolveProductCode(ReportInspectRequest request) {
        if (StringUtils.hasText(request.productCode())) {
            return request.productCode().trim();
        }
        if (!StringUtils.hasText(request.rawProductName())) {
            return null;
        }
        ProductNormalizeResponse normalized = productNormalizerProvider.normalize(
            new ProductNormalizeRequest(request.rawProductName(), request.locale())
        );
        return normalized.needsHumanReview() ? null : normalized.standardProductCode();
    }

    private PriceSummaryResponse findSummary(String productCode, String marketCode) {
        try {
            return priceService.getSummary(productCode, marketCode, null);
        } catch (ApiException exception) {
            if (exception.errorCode() == ErrorCode.PRICE_SUMMARY_NOT_FOUND) {
                return null;
            }
            throw exception;
        }
    }

    private String reviewNote(String statusSuggestion) {
        return switch (statusSuggestion) {
            case "FLAGGED" -> "Flag for manual review before any downstream use.";
            case "REVIEW_REQUIRED" -> "Review manually because the submitted value is outside the fair range.";
            default -> "Keep the report pending for the normal moderation queue.";
        };
    }

    private String userMessage(String statusSuggestion) {
        return switch (statusSuggestion) {
            case "FLAGGED" -> "Thanks for the report. We will check it carefully before using it.";
            case "REVIEW_REQUIRED" -> "Thanks for the report. It needs a short review before it can help the price data.";
            default -> "Thanks for the report. It has been prepared for normal review.";
        };
    }
}

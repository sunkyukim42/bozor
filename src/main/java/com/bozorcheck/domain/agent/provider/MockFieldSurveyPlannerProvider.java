package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.agent.dto.FieldSurveyPlanRequest;
import com.bozorcheck.domain.agent.dto.FieldSurveyPlanResponse;
import com.bozorcheck.domain.agent.dto.SuggestedAction;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductRepository;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketService;
import com.bozorcheck.domain.price.PriceService;
import com.bozorcheck.domain.price.PriceSummaryRepository;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class MockFieldSurveyPlannerProvider implements FieldSurveyPlannerProvider {

    private static final BigDecimal LOW_CONFIDENCE = new BigDecimal("0.50");
    private static final BigDecimal DEVELOPMENT_CONFIDENCE = new BigDecimal("0.60");

    private final MarketService marketService;
    private final ProductRepository productRepository;
    private final PriceSummaryRepository priceSummaryRepository;
    private final PriceService priceService;

    public MockFieldSurveyPlannerProvider(
        MarketService marketService,
        ProductRepository productRepository,
        PriceSummaryRepository priceSummaryRepository,
        PriceService priceService
    ) {
        this.marketService = marketService;
        this.productRepository = productRepository;
        this.priceSummaryRepository = priceSummaryRepository;
        this.priceService = priceService;
    }

    @Override
    public FieldSurveyPlanResponse plan(FieldSurveyPlanRequest request) {
        Market market = marketService.findByCode(request.marketCode());
        LocalDate summaryDate = effectiveDate(request.marketCode(), request.date());
        List<PriceSummaryResponse> summaries = priceSummaryRepository
            .findByMarketCodeAndSummaryDateAndSummaryGrain(request.marketCode(), summaryDate, SummaryGrain.DAILY)
            .stream()
            .map(priceService::toSummaryResponse)
            .toList();
        List<SuggestedAction> targets = surveyTargets(summaries);
        addMissingProductTargets(targets, summaries);
        List<SuggestedAction> actions = recommendedActions(targets);
        String plan = recommendedPlan(targets, market.getName());
        List<String> warnings = targets.isEmpty()
            ? List.of()
            : List.of("Survey plan is based on backend summary coverage and confidence only.");
        return new FieldSurveyPlanResponse(
            request.marketCode(),
            summaryDate,
            targets,
            plan,
            targets,
            actions,
            warnings
        );
    }

    private LocalDate effectiveDate(String marketCode, LocalDate requestedDate) {
        if (requestedDate != null) {
            return requestedDate;
        }
        return priceSummaryRepository.findLatestSummaryDateByMarketCode(marketCode, SummaryGrain.DAILY)
            .orElseThrow(() -> new ApiException(ErrorCode.PRICE_SUMMARY_NOT_FOUND));
    }

    private List<SuggestedAction> surveyTargets(List<PriceSummaryResponse> summaries) {
        return new ArrayList<>(summaries.stream()
            .map(this::targetForSummary)
            .filter(action -> !"LOW".equals(action.priority()))
            .toList());
    }

    private SuggestedAction targetForSummary(PriceSummaryResponse summary) {
        if (summary.sampleCount() < 2 || summary.confidenceScore().compareTo(LOW_CONFIDENCE) < 0) {
            return new SuggestedAction(
                summary.productCode(),
                "HIGH",
                "Very low sample count or confidence.",
                "Collect at least three fresh observations for " + summary.productCode() + "."
            );
        }
        if (summary.sampleCount() < 3 || summary.confidenceScore().compareTo(DEVELOPMENT_CONFIDENCE) < 0) {
            return new SuggestedAction(
                summary.productCode(),
                "MEDIUM",
                "Sample count or confidence is below the target threshold.",
                "Add more observations for " + summary.productCode() + "."
            );
        }
        return new SuggestedAction(summary.productCode(), "LOW", "Enough backend coverage for MVP.", "No urgent survey action.");
    }

    private void addMissingProductTargets(List<SuggestedAction> targets, List<PriceSummaryResponse> summaries) {
        Set<String> covered = new HashSet<>();
        summaries.forEach(summary -> covered.add(summary.productCode()));
        List<Product> activeProducts = productRepository.search(null, true);
        List<SuggestedAction> missingTargets = new ArrayList<>();
        activeProducts.stream()
            .filter(product -> !covered.contains(product.getCode()))
            .forEach(product -> missingTargets.add(new SuggestedAction(
                product.getCode(),
                "HIGH",
                "No summary exists for this market and date.",
                "Collect initial field observations for " + product.getCode() + "."
            )));
        if (!missingTargets.isEmpty()) {
            List<SuggestedAction> combined = new ArrayList<>(targets);
            combined.addAll(missingTargets);
            targets.clear();
            targets.addAll(combined);
        }
    }

    private List<SuggestedAction> recommendedActions(List<SuggestedAction> targets) {
        if (targets.isEmpty()) {
            return List.of(new SuggestedAction(null, "LOW", "Coverage is sufficient for MVP.", "Keep monitoring normal reports."));
        }
        return targets.stream()
            .limit(5)
            .map(target -> new SuggestedAction(
                target.productCode(),
                target.priority(),
                target.reason(),
                "Prioritize " + target.productCode() + " during the next field survey."
            ))
            .toList();
    }

    private String recommendedPlan(List<SuggestedAction> targets, String marketName) {
        if (targets.isEmpty()) {
            return "Keep monitoring normal reports at " + marketName + "; current backend coverage is sufficient for MVP.";
        }

        List<String> productCodes = targets.stream()
            .map(SuggestedAction::productCode)
            .filter(code -> code != null && !code.isBlank())
            .distinct()
            .limit(5)
            .toList();
        String products = String.join(", ", productCodes);
        int remaining = Math.max(0, targets.size() - productCodes.size());
        if (remaining > 0) {
            products = products + ", and " + remaining + " more products";
        }
        return "Collect at least 3 observations for " + products + " at " + marketName
            + ". Prioritize products with low sample count or low confidence score.";
    }
}

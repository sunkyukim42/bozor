package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.agent.dto.MarketBriefingRequest;
import com.bozorcheck.domain.agent.dto.MarketBriefingResponse;
import com.bozorcheck.domain.agent.dto.SuggestedAction;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketService;
import com.bozorcheck.domain.price.PriceService;
import com.bozorcheck.domain.price.PriceSummaryRepository;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MockMarketBriefingProvider implements MarketBriefingProvider {

    private final MarketService marketService;
    private final PriceSummaryRepository priceSummaryRepository;
    private final PriceService priceService;

    public MockMarketBriefingProvider(
        MarketService marketService,
        PriceSummaryRepository priceSummaryRepository,
        PriceService priceService
    ) {
        this.marketService = marketService;
        this.priceSummaryRepository = priceSummaryRepository;
        this.priceService = priceService;
    }

    @Override
    public MarketBriefingResponse brief(MarketBriefingRequest request) {
        Market market = marketService.findByCode(request.marketCode());
        LocalDate summaryDate = effectiveDate(request.marketCode(), request.date());
        List<PriceSummaryResponse> summaries = summaries(request.marketCode(), summaryDate);
        return new MarketBriefingResponse(
            market.getCode(),
            market.getName(),
            summaryDate,
            briefingTitle(market.getName(), summaryDate),
            summaryText(market.getName(), summaries),
            highlights(summaries),
            dataWarnings(summaries),
            recommendedActions(summaries),
            AgentProviderSupport.aggregateSourceSummary(market.getCode(), summaryDate, summaries)
        );
    }

    private LocalDate effectiveDate(String marketCode, LocalDate requestedDate) {
        if (requestedDate != null) {
            return requestedDate;
        }
        return priceSummaryRepository.findLatestSummaryDateByMarketCode(marketCode, SummaryGrain.DAILY)
            .orElseThrow(() -> new ApiException(ErrorCode.PRICE_SUMMARY_NOT_FOUND));
    }

    private List<PriceSummaryResponse> summaries(String marketCode, LocalDate summaryDate) {
        List<PriceSummaryResponse> summaries = priceSummaryRepository
            .findByMarketCodeAndSummaryDateAndSummaryGrain(marketCode, summaryDate, SummaryGrain.DAILY)
            .stream()
            .map(priceService::toSummaryResponse)
            .toList();
        if (summaries.isEmpty()) {
            throw new ApiException(ErrorCode.PRICE_SUMMARY_NOT_FOUND);
        }
        return summaries;
    }

    private List<String> highlights(List<PriceSummaryResponse> summaries) {
        return summaries.stream()
            .limit(4)
            .map(summary -> summary.productCode()
                + " fair midpoint is " + summary.fairMid()
                + " at " + summary.marketName() + ".")
            .toList();
    }

    private String briefingTitle(String marketName, LocalDate summaryDate) {
        return summaryDate + " " + marketName + " price briefing";
    }

    private String summaryText(String marketName, List<PriceSummaryResponse> summaries) {
        return marketName + " has " + summaries.size()
            + " backend price summaries for this date. The briefing uses stored survey/reference data only.";
    }

    private List<String> dataWarnings(List<PriceSummaryResponse> summaries) {
        boolean lowSample = summaries.stream().anyMatch(summary -> summary.sampleCount() < 3);
        boolean lowConfidence = summaries.stream()
            .anyMatch(summary -> summary.confidenceScore().compareTo(new java.math.BigDecimal("0.60")) < 0);
        if (lowSample && lowConfidence) {
            return List.of("Field survey/reference data has low sample counts and development-level confidence.");
        }
        if (lowSample) {
            return List.of("Field survey/reference data has fewer than three samples for some products.");
        }
        if (lowConfidence) {
            return List.of("Some summaries have confidence below 0.60.");
        }
        return List.of();
    }

    private List<SuggestedAction> recommendedActions(List<PriceSummaryResponse> summaries) {
        return summaries.stream()
            .filter(summary -> summary.sampleCount() < 3
                || summary.confidenceScore().compareTo(new java.math.BigDecimal("0.60")) < 0)
            .limit(5)
            .map(summary -> new SuggestedAction(
                summary.productCode(),
                summary.sampleCount() < 2 ? "HIGH" : "MEDIUM",
                "Low sample count or development confidence.",
                "Collect additional field observations for " + summary.productCode() + "."
            ))
            .toList();
    }
}

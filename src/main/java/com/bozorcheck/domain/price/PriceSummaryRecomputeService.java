package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductService;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketService;
import com.bozorcheck.domain.price.dto.PriceSummaryRecomputeRequest;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceSummaryRecomputeService {

    private final ProductService productService;
    private final MarketService marketService;
    private final PriceObservationRepository priceObservationRepository;
    private final PriceSummaryRepository priceSummaryRepository;
    private final PriceService priceService;

    public PriceSummaryRecomputeService(
        ProductService productService,
        MarketService marketService,
        PriceObservationRepository priceObservationRepository,
        PriceSummaryRepository priceSummaryRepository,
        PriceService priceService
    ) {
        this.productService = productService;
        this.marketService = marketService;
        this.priceObservationRepository = priceObservationRepository;
        this.priceSummaryRepository = priceSummaryRepository;
        this.priceService = priceService;
    }

    @Transactional
    public PriceSummaryResponse recompute(PriceSummaryRecomputeRequest request) {
        if (request.summaryGrain() != SummaryGrain.DAILY) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, "Only DAILY recompute is supported in this phase.");
        }

        Product product = productService.findByCode(request.productCode());
        Market market = marketService.findByCode(request.marketCode());
        OffsetDateTime from = OffsetDateTime.of(request.summaryDate(), LocalTime.MIN, ZoneOffset.UTC);
        OffsetDateTime to = from.plusDays(1);
        List<PriceObservation> observations = priceObservationRepository
            .findByProductAndMarketAndStatusAndObservedAtGreaterThanEqualAndObservedAtLessThanOrderByNormalizedPricePerKgAsc(
                product,
                market,
                ReviewStatus.APPROVED,
                from,
                to
            );
        if (observations.isEmpty()) {
            throw new ApiException(ErrorCode.PRICE_OBSERVATION_NOT_FOUND);
        }

        List<BigDecimal> prices = observations.stream()
            .map(PriceObservation::getNormalizedPricePerKg)
            .sorted()
            .toList();
        Map<String, Object> sourceBreakdown = sourceBreakdown(observations);

        PriceSummary summary = priceSummaryRepository
            .findByProductAndMarketAndSummaryDateAndSummaryGrain(
                product,
                market,
                request.summaryDate(),
                request.summaryGrain()
            )
            .orElseGet(PriceSummary::new);
        summary.setProduct(product);
        summary.setMarket(market);
        summary.setSummaryDate(request.summaryDate());
        summary.setSummaryGrain(request.summaryGrain());
        summary.setFairLow(nearestRank(prices, 0.25));
        summary.setFairMid(median(prices));
        summary.setFairHigh(nearestRank(prices, 0.75));
        summary.setMinPrice(prices.getFirst());
        summary.setMaxPrice(prices.getLast());
        summary.setSampleCount(prices.size());
        summary.setSourceBreakdown(sourceBreakdown);
        summary.setConfidenceScore(confidenceScore(prices.size(), sourceBreakdown.size()));
        summary.setComputedAt(OffsetDateTime.now());

        return priceService.toSummaryResponse(priceSummaryRepository.save(summary));
    }

    private BigDecimal nearestRank(List<BigDecimal> prices, double percentile) {
        int index = (int) Math.ceil(percentile * prices.size()) - 1;
        return prices.get(Math.max(0, Math.min(index, prices.size() - 1))).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal median(List<BigDecimal> prices) {
        int size = prices.size();
        if (size % 2 == 1) {
            return prices.get(size / 2).setScale(2, RoundingMode.HALF_UP);
        }
        return prices.get(size / 2 - 1)
            .add(prices.get(size / 2))
            .divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
    }

    private Map<String, Object> sourceBreakdown(List<PriceObservation> observations) {
        Map<String, Object> breakdown = new LinkedHashMap<>();
        for (PriceObservation observation : observations) {
            String sourceCode = observation.getSource().getCode();
            Integer count = (Integer) breakdown.getOrDefault(sourceCode, 0);
            breakdown.put(sourceCode, count + 1);
        }
        return breakdown;
    }

    private BigDecimal confidenceScore(int sampleCount, int distinctSourceCount) {
        double sampleCountScore = Math.min(0.6, sampleCount / 10.0 * 0.6);
        double sourceDiversityScore = Math.min(0.25, distinctSourceCount / 4.0 * 0.25);
        double score = Math.min(1.0, sampleCountScore + sourceDiversityScore + 0.15);
        return BigDecimal.valueOf(score).setScale(3, RoundingMode.HALF_UP);
    }
}

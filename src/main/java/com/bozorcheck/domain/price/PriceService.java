package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductService;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketService;
import com.bozorcheck.domain.price.dto.PriceCheckRequest;
import com.bozorcheck.domain.price.dto.PriceCheckResponse;
import com.bozorcheck.domain.price.dto.PriceHistoryResponse;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class PriceService {

    public static final String DEFAULT_MARKET_CODE = "TASHKENT_CHORSU";

    private final ProductService productService;
    private final MarketService marketService;
    private final PriceSummaryRepository priceSummaryRepository;

    public PriceService(
        ProductService productService,
        MarketService marketService,
        PriceSummaryRepository priceSummaryRepository
    ) {
        this.productService = productService;
        this.marketService = marketService;
        this.priceSummaryRepository = priceSummaryRepository;
    }

    @Transactional(readOnly = true)
    public PriceSummaryResponse getSummary(String productCode, String marketCode, LocalDate date) {
        Product product = productService.findByCode(productCode);
        Market market = marketService.findByCode(defaultMarketCode(marketCode));
        PriceSummary summary = date == null
            ? priceSummaryRepository.findFirstByProductAndMarketAndSummaryGrainOrderBySummaryDateDesc(
                product,
                market,
                SummaryGrain.DAILY
            ).orElseThrow(() -> new ApiException(ErrorCode.PRICE_SUMMARY_NOT_FOUND))
            : priceSummaryRepository.findByProductAndMarketAndSummaryDateAndSummaryGrain(
                product,
                market,
                date,
                SummaryGrain.DAILY
            ).orElseThrow(() -> new ApiException(ErrorCode.PRICE_SUMMARY_NOT_FOUND));
        return toSummaryResponse(summary);
    }

    @Transactional(readOnly = true)
    public PriceHistoryResponse getHistory(
        String productCode,
        String marketCode,
        LocalDate from,
        LocalDate to,
        SummaryGrain grain
    ) {
        Product product = productService.findByCode(productCode);
        Market market = marketService.findByCode(defaultMarketCode(marketCode));
        LocalDate effectiveTo = to == null ? LocalDate.now() : to;
        LocalDate effectiveFrom = from == null ? effectiveTo.minusDays(30) : from;
        SummaryGrain effectiveGrain = grain == null ? SummaryGrain.DAILY : grain;
        List<PriceSummaryResponse> summaries = priceSummaryRepository
            .findByProductAndMarketAndSummaryGrainAndSummaryDateBetweenOrderBySummaryDateAsc(
                product,
                market,
                effectiveGrain,
                effectiveFrom,
                effectiveTo
            )
            .stream()
            .map(this::toSummaryResponse)
            .toList();
        return new PriceHistoryResponse(product.getCode(), market.getCode(), effectiveFrom, effectiveTo, effectiveGrain, summaries);
    }

    @Transactional(readOnly = true)
    public PriceCheckResponse check(PriceCheckRequest request) {
        if (request.quotedPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(ErrorCode.INVALID_PRICE);
        }
        PriceSummaryResponse summary = getSummary(request.productCode(), request.marketCode(), null);
        PriceVerdict verdict = verdict(request.quotedPrice(), summary.fairLow(), summary.fairHigh());
        BigDecimal overFairHighPercent = overFairHighPercent(request.quotedPrice(), summary.fairHigh());
        return new PriceCheckResponse(
            summary.productCode(),
            summary.marketCode(),
            request.quotedPrice(),
            request.unitCode(),
            summary.fairLow(),
            summary.fairMid(),
            summary.fairHigh(),
            verdict,
            summary.fairMid(),
            overFairHighPercent,
            summary.confidenceScore()
        );
    }

    public PriceSummaryResponse toSummaryResponse(PriceSummary summary) {
        Product product = summary.getProduct();
        Market market = summary.getMarket();
        return new PriceSummaryResponse(
            product.getCode(),
            product.getNameEn(),
            market.getCode(),
            market.getName(),
            summary.getSummaryDate(),
            summary.getSummaryGrain(),
            summary.getFairLow(),
            summary.getFairMid(),
            summary.getFairHigh(),
            summary.getMinPrice(),
            summary.getMaxPrice(),
            summary.getSampleCount(),
            summary.getConfidenceScore(),
            summary.getSourceBreakdown(),
            summary.getComputedAt()
        );
    }

    private String defaultMarketCode(String marketCode) {
        return StringUtils.hasText(marketCode) ? marketCode : DEFAULT_MARKET_CODE;
    }

    private PriceVerdict verdict(BigDecimal quotedPrice, BigDecimal fairLow, BigDecimal fairHigh) {
        if (quotedPrice.compareTo(fairLow) <= 0) {
            return PriceVerdict.CHEAP;
        }
        if (quotedPrice.compareTo(fairHigh) <= 0) {
            return PriceVerdict.FAIR;
        }
        if (quotedPrice.compareTo(fairHigh.multiply(new BigDecimal("1.2"))) <= 0) {
            return PriceVerdict.EXPENSIVE;
        }
        return PriceVerdict.VERY_EXPENSIVE;
    }

    private BigDecimal overFairHighPercent(BigDecimal quotedPrice, BigDecimal fairHigh) {
        if (quotedPrice.compareTo(fairHigh) <= 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return quotedPrice.subtract(fairHigh)
            .multiply(new BigDecimal("100"))
            .divide(fairHigh, 2, RoundingMode.HALF_UP);
    }
}

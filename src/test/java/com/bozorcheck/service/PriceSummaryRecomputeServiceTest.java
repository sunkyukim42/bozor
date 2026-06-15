package com.bozorcheck.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import com.bozorcheck.common.enums.QualityGrade;
import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.domain.catalog.ProductRepository;
import com.bozorcheck.domain.market.MarketRepository;
import com.bozorcheck.domain.price.PriceObservation;
import com.bozorcheck.domain.price.PriceObservationRepository;
import com.bozorcheck.domain.price.PriceSummaryRepository;
import com.bozorcheck.domain.price.PriceSummaryRecomputeService;
import com.bozorcheck.domain.price.dto.PriceSummaryRecomputeRequest;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import com.bozorcheck.domain.source.DataSourceRepository;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PriceSummaryRecomputeServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private DataSourceRepository dataSourceRepository;

    @Autowired
    private PriceObservationRepository priceObservationRepository;

    @Autowired
    private PriceSummaryRepository priceSummaryRepository;

    @Autowired
    private PriceSummaryRecomputeService recomputeService;

    @Test
    void recomputeCalculatesBandsBreakdownAndConfidence() {
        LocalDate summaryDate = LocalDate.of(2031, 1, 15);
        var product = productRepository.findByCode("TOMATO").orElseThrow();
        var market = marketRepository.findByCode("TASHKENT_CHORSU").orElseThrow();
        var fieldSurvey = dataSourceRepository.findByCode("FIELD_SURVEY").orElseThrow();
        var adminSeed = dataSourceRepository.findByCode("ADMIN_SEED").orElseThrow();

        cleanupFixtureData(product, market, summaryDate);

        saveObservation(product, market, fieldSurvey, summaryDate, "10000.00");
        saveObservation(product, market, fieldSurvey, summaryDate, "12000.00");
        saveObservation(product, market, adminSeed, summaryDate, "14000.00");
        saveObservation(product, market, adminSeed, summaryDate, "18000.00");

        PriceSummaryResponse response = recomputeService.recompute(new PriceSummaryRecomputeRequest(
            "TOMATO",
            "TASHKENT_CHORSU",
            summaryDate,
            SummaryGrain.DAILY
        ));

        assertThat(response.fairLow()).isLessThanOrEqualTo(response.fairMid());
        assertThat(response.fairMid()).isLessThanOrEqualTo(response.fairHigh());
        assertThat(response.sampleCount()).isEqualTo(4);
        assertThat(response.sourceBreakdown()).containsEntry("FIELD_SURVEY", 2);
        assertThat(response.sourceBreakdown()).containsEntry("ADMIN_SEED", 2);
        assertThat(response.confidenceScore()).isBetween(BigDecimal.ZERO, BigDecimal.ONE);
    }

    private void cleanupFixtureData(
        com.bozorcheck.domain.catalog.Product product,
        com.bozorcheck.domain.market.Market market,
        LocalDate summaryDate
    ) {
        priceSummaryRepository.findByProductAndMarketAndSummaryDateAndSummaryGrain(
            product,
            market,
            summaryDate,
            SummaryGrain.DAILY
        ).ifPresent(priceSummaryRepository::delete);

        OffsetDateTime from = OffsetDateTime.of(summaryDate, LocalTime.MIN, ZoneOffset.UTC);
        OffsetDateTime to = from.plusDays(1);
        priceObservationRepository.deleteAll(priceObservationRepository
            .findByProductAndMarketAndStatusAndObservedAtGreaterThanEqualAndObservedAtLessThanOrderByNormalizedPricePerKgAsc(
                product,
                market,
                ReviewStatus.APPROVED,
                from,
                to
            ));
    }

    private void saveObservation(
        com.bozorcheck.domain.catalog.Product product,
        com.bozorcheck.domain.market.Market market,
        com.bozorcheck.domain.source.DataSource source,
        LocalDate summaryDate,
        String price
    ) {
        PriceObservation observation = new PriceObservation(
            product,
            market,
            source,
            OffsetDateTime.of(summaryDate.atTime(10, 0), ZoneOffset.UTC),
            new BigDecimal(price),
            new BigDecimal(price)
        );
        observation.setQualityGrade(QualityGrade.STANDARD);
        observation.setStatus(ReviewStatus.APPROVED);
        observation.setTrustScore(new BigDecimal("0.800"));
        observation.setRawPayload(new LinkedHashMap<>());
        priceObservationRepository.save(observation);
    }
}

package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.market.Market;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceSummaryRepository extends JpaRepository<PriceSummary, UUID> {

    Optional<PriceSummary> findFirstByProductAndMarketAndSummaryGrainOrderBySummaryDateDesc(
        Product product,
        Market market,
        SummaryGrain summaryGrain
    );

    Optional<PriceSummary> findByProductAndMarketAndSummaryDateAndSummaryGrain(
        Product product,
        Market market,
        LocalDate summaryDate,
        SummaryGrain summaryGrain
    );

    List<PriceSummary> findByProductAndMarketAndSummaryGrainAndSummaryDateBetweenOrderBySummaryDateAsc(
        Product product,
        Market market,
        SummaryGrain summaryGrain,
        LocalDate from,
        LocalDate to
    );
}

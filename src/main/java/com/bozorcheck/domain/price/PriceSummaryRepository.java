package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.market.Market;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
        select max(summary.summaryDate)
        from PriceSummary summary
        where summary.market.code = :marketCode
          and summary.summaryGrain = :summaryGrain
        """)
    Optional<LocalDate> findLatestSummaryDateByMarketCode(
        @Param("marketCode") String marketCode,
        @Param("summaryGrain") SummaryGrain summaryGrain
    );

    @Query("""
        select summary
        from PriceSummary summary
        join fetch summary.product product
        join fetch summary.market market
        where market.code = :marketCode
          and summary.summaryDate = :summaryDate
          and summary.summaryGrain = :summaryGrain
        order by product.code
        """)
    List<PriceSummary> findByMarketCodeAndSummaryDateAndSummaryGrain(
        @Param("marketCode") String marketCode,
        @Param("summaryDate") LocalDate summaryDate,
        @Param("summaryGrain") SummaryGrain summaryGrain
    );
}

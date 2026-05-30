package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.market.Market;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PriceObservationRepository
    extends JpaRepository<PriceObservation, UUID>, JpaSpecificationExecutor<PriceObservation> {

    List<PriceObservation> findByProductAndMarketAndStatusAndObservedAtGreaterThanEqualAndObservedAtLessThanOrderByNormalizedPricePerKgAsc(
        Product product,
        Market market,
        ReviewStatus status,
        OffsetDateTime from,
        OffsetDateTime to
    );
}

package com.bozorcheck;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductRepository;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketRepository;
import com.bozorcheck.domain.price.PriceObservation;
import com.bozorcheck.domain.price.PriceObservationRepository;
import com.bozorcheck.domain.source.DataSource;
import com.bozorcheck.domain.source.DataSourceRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

class JpaMappingSmokeTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private DataSourceRepository dataSourceRepository;

    @Autowired
    private PriceObservationRepository priceObservationRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void seedDataAndCoreMappingsCanBeLoadedAndSaved() {
        assertThat(productRepository.count()).isGreaterThanOrEqualTo(10);

        Product product = productRepository.findByCode("TOMATO").orElseThrow();
        Market market = marketRepository.findByCode("TASHKENT_CHORSU").orElseThrow();
        DataSource source = dataSourceRepository.findByCode("ADMIN_SEED").orElseThrow();

        PriceObservation observation = new PriceObservation(
            product,
            market,
            source,
            OffsetDateTime.now(),
            new BigDecimal("12345.00"),
            new BigDecimal("12345.00")
        );
        observation.setRawPayload(Map.of("note", "smoke test data only"));

        PriceObservation saved = priceObservationRepository.saveAndFlush(observation);
        entityManager.clear();

        assertThat(priceObservationRepository.findById(saved.getId())).isPresent();
    }

    @Test
    void negativePriceAmountFailsDatabaseConstraint() {
        Product product = productRepository.findByCode("TOMATO").orElseThrow();
        Market market = marketRepository.findByCode("TASHKENT_CHORSU").orElseThrow();
        DataSource source = dataSourceRepository.findByCode("ADMIN_SEED").orElseThrow();

        PriceObservation observation = new PriceObservation(
            product,
            market,
            source,
            OffsetDateTime.now(),
            new BigDecimal("-1.00"),
            new BigDecimal("12345.00")
        );
        observation.setRawPayload(Map.of("note", "constraint test data only"));

        assertThatThrownBy(() -> priceObservationRepository.saveAndFlush(observation))
            .isInstanceOf(DataIntegrityViolationException.class);
    }
}

package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductService;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketService;
import com.bozorcheck.domain.price.dto.PriceObservationCreateRequest;
import com.bozorcheck.domain.price.dto.PriceObservationResponse;
import com.bozorcheck.domain.source.DataSource;
import com.bozorcheck.domain.source.DataSourceRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class PriceObservationService {

    private final ProductService productService;
    private final MarketService marketService;
    private final DataSourceRepository dataSourceRepository;
    private final PriceObservationRepository priceObservationRepository;

    public PriceObservationService(
        ProductService productService,
        MarketService marketService,
        DataSourceRepository dataSourceRepository,
        PriceObservationRepository priceObservationRepository
    ) {
        this.productService = productService;
        this.marketService = marketService;
        this.dataSourceRepository = dataSourceRepository;
        this.priceObservationRepository = priceObservationRepository;
    }

    @Transactional
    public PriceObservationResponse create(PriceObservationCreateRequest request) {
        Product product = productService.findByCode(request.productCode());
        Market market = marketService.findByCode(request.marketCode());
        DataSource source = findSourceByCode(request.sourceCode());

        PriceObservation observation = new PriceObservation(
            product,
            market,
            source,
            request.observedAt(),
            request.priceAmount(),
            request.normalizedPricePerKg()
        );
        observation.setCurrency(request.currency());
        observation.setUnitCode(request.unitCode());
        observation.setQualityGrade(request.qualityGrade());
        observation.setStatus(request.status());
        observation.setTrustScore(request.trustScore());
        observation.setRawPayload(request.rawPayload() == null ? new LinkedHashMap<>() : request.rawPayload());
        return toResponse(priceObservationRepository.save(observation));
    }

    @Transactional(readOnly = true)
    public Page<PriceObservationResponse> search(
        String productCode,
        String marketCode,
        String sourceCode,
        ReviewStatus status,
        OffsetDateTime from,
        OffsetDateTime to,
        Pageable pageable
    ) {
        Specification<PriceObservation> spec = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(productCode)) {
                predicates.add(builder.equal(root.get("product").get("code"), productCode));
            }
            if (StringUtils.hasText(marketCode)) {
                predicates.add(builder.equal(root.get("market").get("code"), marketCode));
            }
            if (StringUtils.hasText(sourceCode)) {
                predicates.add(builder.equal(root.get("source").get("code"), sourceCode));
            }
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (from != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("observedAt"), from));
            }
            if (to != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("observedAt"), to));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        return priceObservationRepository.findAll(spec, pageable).map(this::toResponse);
    }

    DataSource findSourceByCode(String sourceCode) {
        return dataSourceRepository.findByCode(sourceCode)
            .orElseThrow(() -> new ApiException(ErrorCode.DATA_SOURCE_NOT_FOUND));
    }

    PriceObservationResponse toResponse(PriceObservation observation) {
        return new PriceObservationResponse(
            observation.getId(),
            observation.getProduct().getCode(),
            observation.getMarket().getCode(),
            observation.getSource().getCode(),
            observation.getObservedAt(),
            observation.getPriceAmount(),
            observation.getCurrency(),
            observation.getUnitCode(),
            observation.getNormalizedPricePerKg(),
            observation.getQualityGrade(),
            observation.getStatus(),
            observation.getTrustScore(),
            observation.getRawPayload()
        );
    }
}

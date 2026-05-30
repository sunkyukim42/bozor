package com.bozorcheck.domain.price;

import com.bozorcheck.common.enums.QualityGrade;
import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.common.util.HashUtils;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductRepository;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.market.MarketService;
import com.bozorcheck.domain.price.dto.PriceReportApproveRequest;
import com.bozorcheck.domain.price.dto.PriceReportCreateRequest;
import com.bozorcheck.domain.price.dto.PriceReportRejectRequest;
import com.bozorcheck.domain.price.dto.PriceReportResponse;
import com.bozorcheck.domain.source.DataSource;
import com.bozorcheck.domain.user.AppUser;
import com.bozorcheck.domain.user.AppUserRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class PriceReportService {

    private final PriceReportRepository priceReportRepository;
    private final PriceObservationRepository priceObservationRepository;
    private final ProductRepository productRepository;
    private final MarketService marketService;
    private final AppUserRepository appUserRepository;
    private final PriceObservationService priceObservationService;

    public PriceReportService(
        PriceReportRepository priceReportRepository,
        PriceObservationRepository priceObservationRepository,
        ProductRepository productRepository,
        MarketService marketService,
        AppUserRepository appUserRepository,
        PriceObservationService priceObservationService
    ) {
        this.priceReportRepository = priceReportRepository;
        this.priceObservationRepository = priceObservationRepository;
        this.productRepository = productRepository;
        this.marketService = marketService;
        this.appUserRepository = appUserRepository;
        this.priceObservationService = priceObservationService;
    }

    @Transactional
    public PriceReportResponse create(PriceReportCreateRequest request, String anonymousKey) {
        if (request.submittedPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(ErrorCode.INVALID_PRICE);
        }
        if (!StringUtils.hasText(request.productCode()) && !StringUtils.hasText(request.rawProductName())) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, "productCode or rawProductName is required.");
        }

        Product product = StringUtils.hasText(request.productCode())
            ? productRepository.findByCode(request.productCode())
                .orElseThrow(() -> new ApiException(ErrorCode.PRODUCT_NOT_FOUND))
            : null;
        Market market = marketService.findByCode(request.marketCode());
        AppUser reporter = resolveReporter(anonymousKey);

        PriceReport report = new PriceReport();
        report.setReporter(reporter);
        report.setProduct(product);
        report.setMarket(market);
        report.setRawProductName(request.rawProductName());
        report.setSubmittedPrice(request.submittedPrice());
        report.setSubmittedUnit(request.submittedUnit());
        report.setPhotoUrl(request.photoUrl());
        report.setLatitude(request.latitude());
        report.setLongitude(request.longitude());
        report.setSubmittedAt(OffsetDateTime.now());
        report.setStatus(ReviewStatus.PENDING);
        return toResponse(priceReportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public Page<PriceReportResponse> search(
        ReviewStatus status,
        String marketCode,
        String productCode,
        Pageable pageable
    ) {
        Specification<PriceReport> spec = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(marketCode)) {
                predicates.add(builder.equal(root.get("market").get("code"), marketCode));
            }
            if (StringUtils.hasText(productCode)) {
                predicates.add(builder.equal(root.get("product").get("code"), productCode));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        return priceReportRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional
    public PriceReportResponse approve(UUID reportId, PriceReportApproveRequest request) {
        PriceReport report = findById(reportId);
        if (report.getStatus() != ReviewStatus.PENDING && report.getStatus() != ReviewStatus.FLAGGED) {
            throw new ApiException(ErrorCode.INVALID_STATUS_TRANSITION);
        }
        if (report.getProduct() == null) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, "A report without a normalized product cannot be approved.");
        }

        String sourceCode = StringUtils.hasText(request.sourceCode()) ? request.sourceCode() : "USER_REPORT";
        DataSource source = priceObservationService.findSourceByCode(sourceCode);
        BigDecimal trustScore = request.trustScore() == null ? new BigDecimal("0.500") : request.trustScore();
        QualityGrade qualityGrade = request.qualityGrade() == null ? QualityGrade.UNKNOWN : request.qualityGrade();
        BigDecimal normalizedPricePerKg = request.normalizedPricePerKg() == null
            ? report.getSubmittedPrice()
            : request.normalizedPricePerKg();

        PriceObservation observation = new PriceObservation(
            report.getProduct(),
            report.getMarket(),
            source,
            report.getSubmittedAt(),
            report.getSubmittedPrice(),
            normalizedPricePerKg
        );
        observation.setCurrency("UZS");
        observation.setUnitCode(report.getSubmittedUnit());
        observation.setQualityGrade(qualityGrade);
        observation.setStatus(ReviewStatus.APPROVED);
        observation.setTrustScore(trustScore);
        observation.setRawPayload(new LinkedHashMap<>());
        PriceObservation savedObservation = priceObservationRepository.save(observation);

        report.setStatus(ReviewStatus.APPROVED);
        report.setNormalizedObservation(savedObservation);
        report.setReviewNote(request.reviewNote());
        return toResponse(report);
    }

    @Transactional
    public PriceReportResponse reject(UUID reportId, PriceReportRejectRequest request) {
        PriceReport report = findById(reportId);
        report.setStatus(ReviewStatus.REJECTED);
        report.setReviewNote(request.reviewNote());
        return toResponse(report);
    }

    private AppUser resolveReporter(String anonymousKey) {
        if (!StringUtils.hasText(anonymousKey)) {
            return null;
        }
        String hash = HashUtils.sha256Hex(anonymousKey);
        return appUserRepository.findByAnonymousKeyHash(hash)
            .orElseGet(() -> appUserRepository.save(new AppUser(hash)));
    }

    private PriceReport findById(UUID reportId) {
        return priceReportRepository.findById(reportId)
            .orElseThrow(() -> new ApiException(ErrorCode.PRICE_REPORT_NOT_FOUND));
    }

    public PriceReportResponse toResponse(PriceReport report) {
        return new PriceReportResponse(
            report.getId(),
            report.getStatus(),
            report.getProduct() == null ? null : report.getProduct().getCode(),
            report.getMarket().getCode(),
            report.getRawProductName(),
            report.getSubmittedPrice(),
            report.getSubmittedUnit(),
            report.getNormalizedObservation() == null ? null : report.getNormalizedObservation().getId(),
            report.getReviewNote(),
            report.getSubmittedAt()
        );
    }
}

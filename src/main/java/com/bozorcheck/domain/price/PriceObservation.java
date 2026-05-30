package com.bozorcheck.domain.price;

import com.bozorcheck.common.BaseTimeEntity;
import com.bozorcheck.common.enums.QualityGrade;
import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.source.DataSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "price_observations")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PriceObservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_id", nullable = false)
    private DataSource source;

    @Column(name = "observed_at", nullable = false)
    private OffsetDateTime observedAt;

    @Column(name = "price_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "UZS";

    @Column(name = "unit_code", nullable = false, length = 16)
    private String unitCode = "KG";

    @Column(name = "normalized_price_per_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal normalizedPricePerKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality_grade", nullable = false, length = 30)
    private QualityGrade qualityGrade = QualityGrade.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ReviewStatus status = ReviewStatus.APPROVED;

    @Column(name = "trust_score", nullable = false, precision = 4, scale = 3)
    private BigDecimal trustScore = BigDecimal.valueOf(0.500);

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> rawPayload = new LinkedHashMap<>();

    public PriceObservation(
        Product product,
        Market market,
        DataSource source,
        OffsetDateTime observedAt,
        BigDecimal priceAmount,
        BigDecimal normalizedPricePerKg
    ) {
        this.product = product;
        this.market = market;
        this.source = source;
        this.observedAt = observedAt;
        this.priceAmount = priceAmount;
        this.normalizedPricePerKg = normalizedPricePerKg;
    }
}

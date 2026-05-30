package com.bozorcheck.domain.price;

import com.bozorcheck.common.BaseTimeEntity;
import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.market.Market;
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
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
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
@Table(
    name = "price_summaries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "market_id", "summary_date", "summary_grain"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PriceSummary extends BaseTimeEntity {

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

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "summary_grain", nullable = false, length = 20)
    private SummaryGrain summaryGrain = SummaryGrain.DAILY;

    @Column(name = "fair_low", nullable = false, precision = 12, scale = 2)
    private BigDecimal fairLow;

    @Column(name = "fair_mid", nullable = false, precision = 12, scale = 2)
    private BigDecimal fairMid;

    @Column(name = "fair_high", nullable = false, precision = 12, scale = 2)
    private BigDecimal fairHigh;

    @Column(name = "min_price", precision = 12, scale = 2)
    private BigDecimal minPrice;

    @Column(name = "max_price", precision = 12, scale = 2)
    private BigDecimal maxPrice;

    @Column(name = "sample_count", nullable = false)
    private int sampleCount = 0;

    @Column(name = "confidence_score", nullable = false, precision = 4, scale = 3)
    private BigDecimal confidenceScore = BigDecimal.valueOf(0.000);

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "source_breakdown", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> sourceBreakdown = new LinkedHashMap<>();

    @Column(name = "computed_at", nullable = false)
    private OffsetDateTime computedAt = OffsetDateTime.now();
}

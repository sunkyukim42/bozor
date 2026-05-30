package com.bozorcheck.domain.price;

import com.bozorcheck.common.BaseTimeEntity;
import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.market.Market;
import com.bozorcheck.domain.user.AppUser;
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
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "price_reports")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PriceReport extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private AppUser reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @Column(name = "raw_product_name", length = 150)
    private String rawProductName;

    @Column(name = "submitted_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal submittedPrice;

    @Column(name = "submitted_unit", nullable = false, length = 16)
    private String submittedUnit = "KG";

    @Column(name = "photo_url", columnDefinition = "text")
    private String photoUrl;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column(name = "review_note", columnDefinition = "text")
    private String reviewNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normalized_observation_id", unique = true)
    private PriceObservation normalizedObservation;
}

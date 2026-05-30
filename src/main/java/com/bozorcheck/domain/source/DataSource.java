package com.bozorcheck.domain.source;

import com.bozorcheck.common.BaseTimeEntity;
import com.bozorcheck.common.enums.SourceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "data_sources")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DataSource extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 60)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private SourceType sourceType;

    @Column(name = "base_url", columnDefinition = "text")
    private String baseUrl;

    @Column(name = "default_trust_weight", nullable = false, precision = 4, scale = 3)
    private BigDecimal defaultTrustWeight = BigDecimal.valueOf(0.500);

    @Column(name = "requires_manual_review", nullable = false)
    private boolean requiresManualReview = false;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}

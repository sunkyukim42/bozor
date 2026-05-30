package com.bozorcheck.domain.market.dto;

import com.bozorcheck.common.enums.MarketType;
import java.math.BigDecimal;
import java.util.UUID;

public record MarketResponse(
    UUID id,
    String code,
    String name,
    String city,
    String district,
    String address,
    BigDecimal latitude,
    BigDecimal longitude,
    MarketType marketType,
    boolean active
) {
}

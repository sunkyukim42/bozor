package com.bozorcheck.domain.market.dto;

import com.bozorcheck.common.enums.MarketType;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MarketUpdateRequest(
    @Size(max = 150) String name,
    @Size(max = 100) String city,
    @Size(max = 100) String district,
    @Size(max = 255) String address,
    BigDecimal latitude,
    BigDecimal longitude,
    MarketType marketType,
    Boolean active
) {
}

package com.bozorcheck.domain.market.dto;

import com.bozorcheck.common.enums.MarketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MarketCreateRequest(
    @NotBlank @Size(max = 60) String code,
    @NotBlank @Size(max = 150) String name,
    @Size(max = 100) String city,
    @Size(max = 100) String district,
    @Size(max = 255) String address,
    BigDecimal latitude,
    BigDecimal longitude,
    @NotNull MarketType marketType,
    @NotNull Boolean active
) {
}

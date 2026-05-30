package com.bozorcheck.domain.price.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PriceCheckRequest(
    @NotBlank @Size(max = 60) String productCode,
    @Size(max = 60) String marketCode,
    @NotNull @Positive BigDecimal quotedPrice,
    @NotBlank @Size(max = 16) String unitCode
) {
}

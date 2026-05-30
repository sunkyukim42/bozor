package com.bozorcheck.domain.price.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PriceReportCreateRequest(
    @Size(max = 60) String productCode,
    @NotBlank @Size(max = 60) String marketCode,
    @Size(max = 150) String rawProductName,
    @NotNull @Positive BigDecimal submittedPrice,
    @NotBlank @Size(max = 16) String submittedUnit,
    String photoUrl,
    BigDecimal latitude,
    BigDecimal longitude
) {
}

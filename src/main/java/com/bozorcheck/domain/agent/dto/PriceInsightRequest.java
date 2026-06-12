package com.bozorcheck.domain.agent.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PriceInsightRequest(
    @NotBlank @Size(max = 60) String productCode,
    @NotBlank @Size(max = 60) String marketCode,
    @NotNull @Positive BigDecimal quotedPrice,
    @NotBlank @Size(max = 16) String unitCode,
    @Size(max = 10) String locale,
    @JsonAlias("includeOptionalPhrase")
    Boolean includeBargainPhrase
) {
}

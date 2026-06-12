package com.bozorcheck.domain.agent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ReportInspectRequest(
    @Size(max = 60) String productCode,
    @Size(max = 150) String rawProductName,
    @NotBlank @Size(max = 60) String marketCode,
    @NotNull @Positive BigDecimal submittedPrice,
    @NotBlank @Size(max = 16) String submittedUnit,
    @Size(max = 10) String locale
) {
}

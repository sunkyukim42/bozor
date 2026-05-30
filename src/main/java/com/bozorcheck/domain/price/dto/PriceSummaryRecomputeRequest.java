package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.SummaryGrain;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PriceSummaryRecomputeRequest(
    @NotBlank @Size(max = 60) String productCode,
    @NotBlank @Size(max = 60) String marketCode,
    @NotNull LocalDate summaryDate,
    @NotNull SummaryGrain summaryGrain
) {
}

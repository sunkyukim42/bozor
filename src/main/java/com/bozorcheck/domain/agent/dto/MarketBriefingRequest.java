package com.bozorcheck.domain.agent.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record MarketBriefingRequest(
    @NotBlank @Size(max = 60) String marketCode,
    @JsonAlias("summaryDate")
    LocalDate date,
    @Size(max = 10) String locale
) {
}

package com.bozorcheck.domain.agent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductNormalizeRequest(
    @NotBlank @Size(max = 150) String rawProductName,
    @Size(max = 10) String locale
) {
}

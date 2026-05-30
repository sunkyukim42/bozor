package com.bozorcheck.domain.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductAliasRequest(
    @NotBlank @Size(max = 20) String locale,
    @NotBlank @Size(max = 120) String alias
) {
}

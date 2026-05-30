package com.bozorcheck.domain.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProductCreateRequest(
    @NotBlank @Size(max = 50) String categoryCode,
    @NotBlank @Size(max = 60) String code,
    @NotBlank @Size(max = 100) String nameKo,
    @NotBlank @Size(max = 100) String nameEn,
    @Size(max = 100) String nameUz,
    @Size(max = 100) String nameRu,
    @NotBlank @Size(max = 16) String defaultUnit,
    @NotNull Boolean seasonal,
    @NotNull Boolean active,
    @Valid List<ProductAliasRequest> aliases
) {
}

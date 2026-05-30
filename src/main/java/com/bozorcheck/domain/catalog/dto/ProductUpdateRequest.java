package com.bozorcheck.domain.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProductUpdateRequest(
    @Size(max = 100) String nameKo,
    @Size(max = 100) String nameEn,
    @Size(max = 100) String nameUz,
    @Size(max = 100) String nameRu,
    @Size(max = 16) String defaultUnit,
    Boolean seasonal,
    Boolean active,
    @Valid List<ProductAliasRequest> aliases
) {
}

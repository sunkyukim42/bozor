package com.bozorcheck.domain.catalog.dto;

import java.util.List;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String code,
    String nameKo,
    String nameEn,
    String nameUz,
    String nameRu,
    String defaultUnit,
    boolean seasonal,
    boolean active,
    List<ProductAliasResponse> aliases
) {
}

package com.bozorcheck.domain.catalog;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductAliasRepository extends JpaRepository<ProductAlias, UUID> {
}

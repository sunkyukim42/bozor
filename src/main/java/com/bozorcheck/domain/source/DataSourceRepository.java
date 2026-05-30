package com.bozorcheck.domain.source;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataSourceRepository extends JpaRepository<DataSource, UUID> {

    Optional<DataSource> findByCode(String code);
}

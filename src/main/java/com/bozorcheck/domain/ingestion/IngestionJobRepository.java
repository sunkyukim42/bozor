package com.bozorcheck.domain.ingestion;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngestionJobRepository extends JpaRepository<IngestionJob, UUID> {
}

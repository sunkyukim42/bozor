package com.bozorcheck.domain.price;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PriceReportRepository extends JpaRepository<PriceReport, UUID>, JpaSpecificationExecutor<PriceReport> {
}

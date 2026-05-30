package com.bozorcheck.domain.price;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceReportRepository extends JpaRepository<PriceReport, UUID> {
}

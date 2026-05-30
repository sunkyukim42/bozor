package com.bozorcheck.domain.market;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketRepository extends JpaRepository<Market, UUID> {

    Optional<Market> findByCode(String code);
}

package com.bozorcheck.domain.price.dto;

import com.bozorcheck.common.enums.SummaryGrain;
import java.time.LocalDate;
import java.util.List;

public record PriceHistoryResponse(
    String productCode,
    String marketCode,
    LocalDate from,
    LocalDate to,
    SummaryGrain grain,
    List<PriceSummaryResponse> summaries
) {
}

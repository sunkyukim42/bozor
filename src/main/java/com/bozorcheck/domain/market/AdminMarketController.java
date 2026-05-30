package com.bozorcheck.domain.market;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.domain.market.dto.MarketCreateRequest;
import com.bozorcheck.domain.market.dto.MarketResponse;
import com.bozorcheck.domain.market.dto.MarketUpdateRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// MVP development endpoint. Authentication must be added before production use.
@RestController
@RequestMapping("/api/v1/admin/markets")
public class AdminMarketController {

    private final MarketService marketService;

    public AdminMarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @PostMapping
    public ApiResponse<MarketResponse> create(@Valid @RequestBody MarketCreateRequest request) {
        return ApiResponse.ok(marketService.create(request));
    }

    @PatchMapping("/{marketId}")
    public ApiResponse<MarketResponse> update(
        @PathVariable UUID marketId,
        @Valid @RequestBody MarketUpdateRequest request
    ) {
        return ApiResponse.ok(marketService.update(marketId, request));
    }
}

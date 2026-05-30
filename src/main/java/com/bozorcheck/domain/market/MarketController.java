package com.bozorcheck.domain.market;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.common.enums.MarketType;
import com.bozorcheck.domain.market.dto.MarketResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/markets")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping
    public ApiResponse<List<MarketResponse>> search(
        @RequestParam(required = false) MarketType type,
        @RequestParam(defaultValue = "true") Boolean active,
        @RequestParam(required = false) String city
    ) {
        return ApiResponse.ok(marketService.search(type, active, city));
    }

    @GetMapping("/{marketId}")
    public ApiResponse<MarketResponse> get(@PathVariable UUID marketId) {
        return ApiResponse.ok(marketService.get(marketId));
    }
}

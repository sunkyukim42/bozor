package com.bozorcheck.domain.price;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.domain.price.dto.PriceSummaryRecomputeRequest;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// MVP development endpoint. Authentication must be added before production use.
@RestController
@RequestMapping("/api/v1/admin/price-summaries")
public class AdminPriceSummaryController {

    private final PriceSummaryRecomputeService priceSummaryRecomputeService;

    public AdminPriceSummaryController(PriceSummaryRecomputeService priceSummaryRecomputeService) {
        this.priceSummaryRecomputeService = priceSummaryRecomputeService;
    }

    @PostMapping("/recompute")
    public ApiResponse<PriceSummaryResponse> recompute(@Valid @RequestBody PriceSummaryRecomputeRequest request) {
        return ApiResponse.ok(priceSummaryRecomputeService.recompute(request));
    }
}

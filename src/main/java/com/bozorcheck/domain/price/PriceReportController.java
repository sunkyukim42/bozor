package com.bozorcheck.domain.price;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.domain.price.dto.PriceReportCreateRequest;
import com.bozorcheck.domain.price.dto.PriceReportResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class PriceReportController {

    private final PriceReportService priceReportService;

    public PriceReportController(PriceReportService priceReportService) {
        this.priceReportService = priceReportService;
    }

    @PostMapping
    public ApiResponse<PriceReportResponse> create(
        @RequestHeader(name = "X-Anonymous-Key", required = false) String anonymousKey,
        @Valid @RequestBody PriceReportCreateRequest request
    ) {
        return ApiResponse.ok(priceReportService.create(request, anonymousKey));
    }
}

package com.bozorcheck.domain.price;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.domain.price.dto.PriceCheckRequest;
import com.bozorcheck.domain.price.dto.PriceCheckResponse;
import com.bozorcheck.domain.price.dto.PriceHistoryResponse;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/prices")
public class PriceController {

    private final PriceService priceService;

    public PriceController(PriceService priceService) {
        this.priceService = priceService;
    }

    @GetMapping("/summary")
    public ApiResponse<PriceSummaryResponse> summary(
        @RequestParam @NotBlank String productCode,
        @RequestParam(required = false) String marketCode,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.ok(priceService.getSummary(productCode, marketCode, date));
    }

    @GetMapping("/history")
    public ApiResponse<PriceHistoryResponse> history(
        @RequestParam @NotBlank String productCode,
        @RequestParam(required = false) String marketCode,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(defaultValue = "DAILY") SummaryGrain grain
    ) {
        return ApiResponse.ok(priceService.getHistory(productCode, marketCode, from, to, grain));
    }

    @PostMapping("/check")
    public ApiResponse<PriceCheckResponse> check(@Valid @RequestBody PriceCheckRequest request) {
        return ApiResponse.ok(priceService.check(request));
    }
}

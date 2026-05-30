package com.bozorcheck.domain.price;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.common.api.PageResponse;
import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.domain.price.dto.PriceReportApproveRequest;
import com.bozorcheck.domain.price.dto.PriceReportRejectRequest;
import com.bozorcheck.domain.price.dto.PriceReportResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// MVP development endpoint. Authentication must be added before production use.
@RestController
@RequestMapping("/api/v1/admin/reports")
public class AdminPriceReportController {

    private final PriceReportService priceReportService;

    public AdminPriceReportController(PriceReportService priceReportService) {
        this.priceReportService = priceReportService;
    }

    @GetMapping
    public ApiResponse<PageResponse<PriceReportResponse>> search(
        @RequestParam(required = false) ReviewStatus status,
        @RequestParam(required = false) String marketCode,
        @RequestParam(required = false) String productCode,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return ApiResponse.ok(PageResponse.from(priceReportService.search(status, marketCode, productCode, pageRequest)));
    }

    @PostMapping("/{reportId}/approve")
    public ApiResponse<PriceReportResponse> approve(
        @PathVariable UUID reportId,
        @Valid @RequestBody PriceReportApproveRequest request
    ) {
        return ApiResponse.ok(priceReportService.approve(reportId, request));
    }

    @PostMapping("/{reportId}/reject")
    public ApiResponse<PriceReportResponse> reject(
        @PathVariable UUID reportId,
        @Valid @RequestBody PriceReportRejectRequest request
    ) {
        return ApiResponse.ok(priceReportService.reject(reportId, request));
    }
}

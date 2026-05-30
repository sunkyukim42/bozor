package com.bozorcheck.domain.price;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.common.api.PageResponse;
import com.bozorcheck.common.enums.ReviewStatus;
import com.bozorcheck.domain.price.dto.PriceObservationCreateRequest;
import com.bozorcheck.domain.price.dto.PriceObservationResponse;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// MVP development endpoint. Authentication must be added before production use.
@RestController
@RequestMapping("/api/v1/admin/price-observations")
public class AdminPriceObservationController {

    private final PriceObservationService priceObservationService;

    public AdminPriceObservationController(PriceObservationService priceObservationService) {
        this.priceObservationService = priceObservationService;
    }

    @PostMapping
    public ApiResponse<PriceObservationResponse> create(@Valid @RequestBody PriceObservationCreateRequest request) {
        return ApiResponse.ok(priceObservationService.create(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<PriceObservationResponse>> search(
        @RequestParam(required = false) String productCode,
        @RequestParam(required = false) String marketCode,
        @RequestParam(required = false) String sourceCode,
        @RequestParam(required = false) ReviewStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "observedAt"));
        return ApiResponse.ok(PageResponse.from(
            priceObservationService.search(productCode, marketCode, sourceCode, status, from, to, pageRequest)
        ));
    }
}

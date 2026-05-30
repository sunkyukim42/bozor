package com.bozorcheck.domain.catalog;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.domain.catalog.dto.ProductCreateRequest;
import com.bozorcheck.domain.catalog.dto.ProductResponse;
import com.bozorcheck.domain.catalog.dto.ProductUpdateRequest;
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
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        return ApiResponse.ok(productService.create(request));
    }

    @PatchMapping("/{productId}")
    public ApiResponse<ProductResponse> update(
        @PathVariable UUID productId,
        @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ApiResponse.ok(productService.update(productId, request));
    }
}

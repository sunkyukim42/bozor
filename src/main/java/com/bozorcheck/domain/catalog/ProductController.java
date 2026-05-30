package com.bozorcheck.domain.catalog;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.domain.catalog.dto.ProductResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> search(
        @RequestParam(required = false) String query,
        @RequestParam(defaultValue = "true") Boolean active,
        @RequestParam(defaultValue = "en") String locale
    ) {
        return ApiResponse.ok(productService.search(query, active));
    }

    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> get(@PathVariable UUID productId) {
        return ApiResponse.ok(productService.get(productId));
    }
}

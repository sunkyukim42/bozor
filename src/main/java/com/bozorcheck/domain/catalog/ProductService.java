package com.bozorcheck.domain.catalog;

import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.catalog.dto.ProductAliasRequest;
import com.bozorcheck.domain.catalog.dto.ProductAliasResponse;
import com.bozorcheck.domain.catalog.dto.ProductCreateRequest;
import com.bozorcheck.domain.catalog.dto.ProductResponse;
import com.bozorcheck.domain.catalog.dto.ProductUpdateRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductAliasRepository productAliasRepository;

    public ProductService(
        ProductRepository productRepository,
        ProductCategoryRepository productCategoryRepository,
        ProductAliasRepository productAliasRepository
    ) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productAliasRepository = productAliasRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String query, Boolean active) {
        Boolean activeFilter = active == null ? Boolean.TRUE : active;
        String normalizedQuery = StringUtils.hasText(query) ? query.trim() : null;
        return productRepository.search(normalizedQuery, activeFilter)
            .stream()
            .map(product -> toResponse(product, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse get(UUID productId) {
        return toResponse(findById(productId), true);
    }

    @Transactional
    public ProductResponse create(ProductCreateRequest request) {
        ProductCategory category = productCategoryRepository.findByCode(request.categoryCode())
            .orElseThrow(() -> new ApiException(ErrorCode.VALIDATION_ERROR, "Product category not found."));

        Product product = new Product();
        product.setCategory(category);
        product.setCode(request.code());
        product.setNameKo(request.nameKo());
        product.setNameEn(request.nameEn());
        product.setNameUz(request.nameUz());
        product.setNameRu(request.nameRu());
        product.setDefaultUnit(request.defaultUnit());
        product.setSeasonal(request.seasonal());
        product.setActive(request.active());

        Product saved = productRepository.save(product);
        replaceAliases(saved, request.aliases());
        return toResponse(saved, true);
    }

    @Transactional
    public ProductResponse update(UUID productId, ProductUpdateRequest request) {
        Product product = findById(productId);
        if (request.nameKo() != null) {
            product.setNameKo(request.nameKo());
        }
        if (request.nameEn() != null) {
            product.setNameEn(request.nameEn());
        }
        if (request.nameUz() != null) {
            product.setNameUz(request.nameUz());
        }
        if (request.nameRu() != null) {
            product.setNameRu(request.nameRu());
        }
        if (request.defaultUnit() != null) {
            product.setDefaultUnit(request.defaultUnit());
        }
        if (request.seasonal() != null) {
            product.setSeasonal(request.seasonal());
        }
        if (request.active() != null) {
            product.setActive(request.active());
        }
        if (request.aliases() != null) {
            replaceAliases(product, request.aliases());
        }
        return toResponse(product, true);
    }

    public Product findByCode(String code) {
        return productRepository.findByCode(code)
            .orElseThrow(() -> new ApiException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private Product findById(UUID productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ApiException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private void replaceAliases(Product product, List<ProductAliasRequest> aliases) {
        productAliasRepository.deleteByProduct(product);
        if (aliases == null || aliases.isEmpty()) {
            return;
        }
        List<ProductAlias> newAliases = aliases.stream()
            .map(aliasRequest -> {
                ProductAlias alias = new ProductAlias();
                alias.setProduct(product);
                alias.setLocale(aliasRequest.locale());
                alias.setAlias(aliasRequest.alias());
                return alias;
            })
            .toList();
        productAliasRepository.saveAll(newAliases);
    }

    private ProductResponse toResponse(Product product, boolean includeAliases) {
        List<ProductAliasResponse> aliases = includeAliases
            ? productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(product.getId()).stream()
                .map(alias -> new ProductAliasResponse(alias.getLocale(), alias.getAlias()))
                .toList()
            : List.of();
        return new ProductResponse(
            product.getId(),
            product.getCode(),
            product.getNameKo(),
            product.getNameEn(),
            product.getNameUz(),
            product.getNameRu(),
            product.getDefaultUnit(),
            product.isSeasonal(),
            product.isActive(),
            aliases
        );
    }
}

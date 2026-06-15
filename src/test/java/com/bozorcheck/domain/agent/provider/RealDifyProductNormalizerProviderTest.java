package com.bozorcheck.domain.agent.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bozorcheck.domain.agent.dto.ProductNormalizeRequest;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductAlias;
import com.bozorcheck.domain.catalog.ProductAliasRepository;
import com.bozorcheck.domain.catalog.ProductRepository;
import com.bozorcheck.infra.dify.DifyWorkflowClient;
import com.bozorcheck.infra.dify.DifyWorkflowErrorCode;
import com.bozorcheck.infra.dify.DifyWorkflowException;
import com.bozorcheck.infra.dify.DifyWorkflowType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RealDifyProductNormalizerProviderTest {

    private DifyWorkflowClient difyWorkflowClient;
    private ProductRepository productRepository;
    private ProductAliasRepository productAliasRepository;
    private RealDifyProductNormalizerProvider provider;
    private Product tomato;
    private Product vegetableOil;

    @BeforeEach
    void setUp() {
        difyWorkflowClient = mock(DifyWorkflowClient.class);
        productRepository = mock(ProductRepository.class);
        productAliasRepository = mock(ProductAliasRepository.class);
        MockProductNormalizerProvider fallbackProvider = new MockProductNormalizerProvider(
            productRepository,
            productAliasRepository
        );
        provider = new RealDifyProductNormalizerProvider(
            difyWorkflowClient,
            fallbackProvider,
            productRepository,
            productAliasRepository,
            new ObjectMapper()
        );

        tomato = product("TOMATO", "Tomato", "KG", true);
        vegetableOil = product("VEGETABLE_OIL", "Vegetable Oil", "LITER", true);
        when(productRepository.search(null, true)).thenReturn(List.of(tomato, vegetableOil));
        when(productRepository.findByCode("TOMATO")).thenReturn(Optional.of(tomato));
        when(productRepository.findByCode("VEGETABLE_OIL")).thenReturn(Optional.of(vegetableOil));
        ProductAlias pomidor = alias("pomidor");
        ProductAlias pinkGreenhousePomidor = alias("pink greenhouse pomidor");
        ProductAlias sunflowerOil = alias("sunflower oil");
        ProductAlias vegetableOilAlias = alias("vegetable oil");
        when(productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(tomato.getId()))
            .thenReturn(List.of(pomidor, pinkGreenhousePomidor));
        when(productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(vegetableOil.getId()))
            .thenReturn(List.of(sunflowerOil, vegetableOilAlias));
    }

    @Test
    void mapsSuccessfulDifyOutputToResponse() {
        whenDifyReturns(Map.of(
            "standardProductCode", "TOMATO",
            "standardProductName", "Tomato",
            "variant", "PINK_GREENHOUSE",
            "normalizedUnitCode", "KG",
            "matchConfidence", 0.91,
            "needsHumanReview", false,
            "reason", "Matched Dify workflow product catalog."
        ));

        ProductNormalizeResponse response = provider.normalize(new ProductNormalizeRequest(
            "pink greenhouse pomidor",
            "en"
        ));

        assertThat(response.standardProductCode()).isEqualTo("TOMATO");
        assertThat(response.standardProductName()).isEqualTo("Tomato");
        assertThat(response.variant()).isEqualTo("PINK_GREENHOUSE");
        assertThat(response.matchConfidence()).isEqualByComparingTo(new BigDecimal("0.91"));
        assertThat(response.needsHumanReview()).isFalse();
        assertThat(response.matchedAliases()).contains("pink greenhouse pomidor");
    }

    @Test
    void unknownProductForcesHumanReview() {
        whenDifyReturns(Map.of(
            "standardProductCode", "UNKNOWN",
            "variant", "UNKNOWN",
            "normalizedUnitCode", "UNKNOWN",
            "matchConfidence", 0.3,
            "needsHumanReview", false,
            "reason", "No known catalog match."
        ));

        ProductNormalizeResponse response = provider.normalize(new ProductNormalizeRequest(
            "unknown local vegetable",
            "en"
        ));

        assertThat(response.standardProductCode()).isNull();
        assertThat(response.standardProductName()).isNull();
        assertThat(response.variant()).isEqualTo("UNKNOWN");
        assertThat(response.needsHumanReview()).isTrue();
        assertThat(response.matchConfidence()).isEqualByComparingTo(new BigDecimal("0.3"));
    }

    @Test
    void lowConfidenceForcesHumanReview() {
        whenDifyReturns(Map.of(
            "standardProductCode", "TOMATO",
            "standardProductName", "Tomato",
            "variant", "STANDARD",
            "normalizedUnitCode", "KG",
            "matchConfidence", 0.5,
            "needsHumanReview", false,
            "reason", "Weak semantic match."
        ));

        ProductNormalizeResponse response = provider.normalize(new ProductNormalizeRequest("tomato", "en"));

        assertThat(response.standardProductCode()).isEqualTo("TOMATO");
        assertThat(response.needsHumanReview()).isTrue();
        assertThat(response.matchConfidence()).isEqualByComparingTo(new BigDecimal("0.5"));
    }

    @Test
    void invalidProductCodeFallsBackToMock() {
        whenDifyReturns(Map.of(
            "standardProductCode", "INVALID_CODE",
            "variant", "STANDARD",
            "normalizedUnitCode", "KG",
            "matchConfidence", 0.95,
            "needsHumanReview", false
        ));

        ProductNormalizeResponse response = provider.normalize(new ProductNormalizeRequest("pink greenhouse pomidor", "en"));

        assertThat(response.standardProductCode()).isEqualTo("TOMATO");
        assertThat(response.variant()).isEqualTo("PINK_GREENHOUSE");
        assertThat(response.explanation()).contains("backend product");
    }

    @Test
    void difyExceptionFallsBackToMock() {
        when(difyWorkflowClient.runWorkflow(eq(DifyWorkflowType.PRODUCT_NORMALIZER), any(), eq("product-normalizer")))
            .thenThrow(new DifyWorkflowException(DifyWorkflowErrorCode.TIMEOUT, "timeout"));

        ProductNormalizeResponse response = provider.normalize(new ProductNormalizeRequest("pink greenhouse pomidor", "en"));

        assertThat(response.standardProductCode()).isEqualTo("TOMATO");
        assertThat(response.variant()).isEqualTo("PINK_GREENHOUSE");
    }

    @Test
    void doesNotOvermatchUnknownLocalVegetable() {
        whenDifyReturns(Map.of(
            "standardProductCode", "VEGETABLE_OIL",
            "standardProductName", "Vegetable Oil",
            "variant", "STANDARD",
            "normalizedUnitCode", "LITER",
            "matchConfidence", 0.95,
            "needsHumanReview", false,
            "reason", "Overmatched a generic vegetable term."
        ));

        ProductNormalizeResponse response = provider.normalize(new ProductNormalizeRequest(
            "unknown local vegetable",
            "en"
        ));

        assertThat(response.standardProductCode()).isNull();
        assertThat(response.variant()).isEqualTo("UNKNOWN");
        assertThat(response.needsHumanReview()).isTrue();
    }

    private void whenDifyReturns(Map<String, Object> outputs) {
        when(difyWorkflowClient.runWorkflow(eq(DifyWorkflowType.PRODUCT_NORMALIZER), any(), eq("product-normalizer")))
            .thenReturn(outputs);
    }

    private Product product(String code, String nameEn, String defaultUnit, boolean active) {
        Product product = mock(Product.class);
        when(product.getId()).thenReturn(UUID.randomUUID());
        when(product.getCode()).thenReturn(code);
        when(product.getNameEn()).thenReturn(nameEn);
        when(product.getNameKo()).thenReturn(nameEn);
        when(product.getNameUz()).thenReturn(nameEn);
        when(product.getNameRu()).thenReturn(nameEn);
        when(product.getDefaultUnit()).thenReturn(defaultUnit);
        when(product.isActive()).thenReturn(active);
        return product;
    }

    private ProductAlias alias(String value) {
        ProductAlias alias = mock(ProductAlias.class);
        when(alias.getAlias()).thenReturn(value);
        return alias;
    }
}

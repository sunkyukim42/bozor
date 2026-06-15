package com.bozorcheck.domain.agent.provider;

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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Primary
@Component
@ConditionalOnProperty(name = "agent.dify.enabled", havingValue = "true")
public class RealDifyProductNormalizerProvider implements ProductNormalizerProvider {

    private static final Logger log = LoggerFactory.getLogger(RealDifyProductNormalizerProvider.class);
    private static final BigDecimal HUMAN_REVIEW_CONFIDENCE_THRESHOLD = new BigDecimal("0.65");
    private static final BigDecimal UNKNOWN_CONFIDENCE = new BigDecimal("0.20");
    private static final Set<String> ALLOWED_VARIANTS = Set.of(
        "PINK_GREENHOUSE",
        "RED_GREENHOUSE",
        "GREENHOUSE",
        "LOCAL",
        "CHERRY",
        "STANDARD",
        "UNKNOWN"
    );
    private static final Set<String> ALLOWED_UNIT_CODES = Set.of(
        "KG",
        "PCS_10",
        "LITER",
        "BUNDLE",
        "PCS",
        "UNKNOWN"
    );

    private final DifyWorkflowClient difyWorkflowClient;
    private final MockProductNormalizerProvider fallbackProvider;
    private final ProductRepository productRepository;
    private final ProductAliasRepository productAliasRepository;
    private final ObjectMapper objectMapper;

    public RealDifyProductNormalizerProvider(
        DifyWorkflowClient difyWorkflowClient,
        MockProductNormalizerProvider fallbackProvider,
        ProductRepository productRepository,
        ProductAliasRepository productAliasRepository,
        ObjectMapper objectMapper
    ) {
        this.difyWorkflowClient = difyWorkflowClient;
        this.fallbackProvider = fallbackProvider;
        this.productRepository = productRepository;
        this.productAliasRepository = productAliasRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public ProductNormalizeResponse normalize(ProductNormalizeRequest request) {
        try {
            Map<String, Object> outputs = difyWorkflowClient.runWorkflow(
                DifyWorkflowType.PRODUCT_NORMALIZER,
                difyInputs(request),
                "product-normalizer"
            );
            return mapOutputs(request, outputs);
        } catch (DifyWorkflowException exception) {
            return fallback(request, exception.errorCode());
        } catch (RuntimeException exception) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }
    }

    private Map<String, Object> difyInputs(ProductNormalizeRequest request) {
        Map<String, Object> inputs = new LinkedHashMap<>();
        inputs.put("rawProductName", request.rawProductName());
        inputs.put("locale", StringUtils.hasText(request.locale()) ? request.locale() : "en");
        inputs.put("marketCode", "");
        inputs.put("unitText", "");
        inputs.put("knownAliasesJson", knownAliasesJson());
        inputs.put("userContext", "search");
        return inputs;
    }

    private String knownAliasesJson() {
        List<Map<String, Object>> products = productRepository.search(null, true).stream()
            .map(product -> {
                Map<String, Object> productMap = new LinkedHashMap<>();
                productMap.put("code", product.getCode());
                productMap.put("nameEn", product.getNameEn());
                productMap.put("nameKo", product.getNameKo());
                productMap.put("nameUz", product.getNameUz());
                productMap.put("nameRu", product.getNameRu());
                productMap.put("defaultUnit", product.getDefaultUnit());
                productMap.put(
                    "aliases",
                    productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(product.getId()).stream()
                        .map(ProductAlias::getAlias)
                        .toList()
                );
                return productMap;
            })
            .toList();
        try {
            return objectMapper.writeValueAsString(products);
        } catch (JsonProcessingException exception) {
            log.warn("Failed to serialize known aliases for Dify product normalizer; using empty alias list.");
            return "[]";
        }
    }

    private ProductNormalizeResponse mapOutputs(ProductNormalizeRequest request, Map<String, Object> outputs) {
        String productCode = requiredString(outputs, "standardProductCode").toUpperCase(Locale.ROOT);
        String unitCode = requiredString(outputs, "normalizedUnitCode").toUpperCase(Locale.ROOT);
        BigDecimal confidence = clamp(requiredConfidence(outputs.get("matchConfidence")));
        boolean needsHumanReview = requiredBoolean(outputs.get("needsHumanReview"));

        if (!ALLOWED_UNIT_CODES.contains(unitCode)) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }
        if ("UNKNOWN".equals(productCode)) {
            return unknownResponse(request, confidence, reason(outputs));
        }
        if (isUnsafeVegetableOilOvermatch(request.rawProductName(), productCode, needsHumanReview, confidence)) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }

        Product product = productRepository.findByCode(productCode)
            .filter(Product::isActive)
            .orElse(null);
        if (product == null) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }

        String variant = optionalString(outputs, "variant", "STANDARD").toUpperCase(Locale.ROOT);
        if (!ALLOWED_VARIANTS.contains(variant) || "UNKNOWN".equals(variant)) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }

        boolean review = needsHumanReview || confidence.compareTo(HUMAN_REVIEW_CONFIDENCE_THRESHOLD) < 0;
        String standardProductName = optionalString(outputs, "standardProductName", product.getNameEn());
        return new ProductNormalizeResponse(
            request.rawProductName(),
            product.getCode(),
            StringUtils.hasText(standardProductName) ? standardProductName : product.getNameEn(),
            variant,
            confidence,
            review,
            matchedAliases(product, request.rawProductName()),
            explanation(reason(outputs), review)
        );
    }

    private ProductNormalizeResponse unknownResponse(
        ProductNormalizeRequest request,
        BigDecimal confidence,
        String reason
    ) {
        return new ProductNormalizeResponse(
            request.rawProductName(),
            null,
            null,
            "UNKNOWN",
            confidence.max(UNKNOWN_CONFIDENCE),
            true,
            List.of(),
            explanation(reason, true)
        );
    }

    private String requiredString(Map<String, Object> outputs, String key) {
        Object value = outputs.get(key);
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            return stringValue.trim();
        }
        throw new DifyWorkflowException(
            DifyWorkflowErrorCode.INVALID_RESPONSE,
            "Dify product normalizer output was missing " + key + "."
        );
    }

    private String optionalString(Map<String, Object> outputs, String key, String defaultValue) {
        Object value = outputs.get(key);
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            return stringValue.trim();
        }
        return defaultValue;
    }

    private BigDecimal requiredConfidence(Object value) {
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            try {
                return new BigDecimal(stringValue.trim());
            } catch (NumberFormatException exception) {
                throw invalidResponse("Dify product normalizer confidence was malformed.");
            }
        }
        throw invalidResponse("Dify product normalizer confidence was missing.");
    }

    private boolean requiredBoolean(Object value) {
        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            if ("true".equalsIgnoreCase(stringValue.trim())) {
                return true;
            }
            if ("false".equalsIgnoreCase(stringValue.trim())) {
                return false;
            }
        }
        throw invalidResponse("Dify product normalizer review flag was missing or malformed.");
    }

    private DifyWorkflowException invalidResponse(String message) {
        return new DifyWorkflowException(DifyWorkflowErrorCode.INVALID_RESPONSE, message);
    }

    private BigDecimal clamp(BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        if (value.compareTo(BigDecimal.ONE) > 0) {
            return BigDecimal.ONE;
        }
        return value;
    }

    private String reason(Map<String, Object> outputs) {
        return optionalString(outputs, "reason", "Normalized by Dify product normalizer workflow.");
    }

    private String explanation(String reason, boolean needsHumanReview) {
        if (needsHumanReview) {
            return reason + " Human review is required before using this match confidently.";
        }
        return reason;
    }

    private List<String> matchedAliases(Product product, String rawProductName) {
        String normalizedRaw = normalizeText(rawProductName);
        return productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(product.getId()).stream()
            .map(ProductAlias::getAlias)
            .filter(alias -> {
                String normalizedAlias = normalizeText(alias);
                return normalizedRaw.equals(normalizedAlias)
                    || normalizedRaw.contains(normalizedAlias)
                    || normalizedAlias.contains(normalizedRaw);
            })
            .distinct()
            .toList();
    }

    private boolean isUnsafeVegetableOilOvermatch(
        String rawProductName,
        String productCode,
        boolean needsHumanReview,
        BigDecimal confidence
    ) {
        String normalizedRaw = normalizeText(rawProductName);
        return "VEGETABLE_OIL".equals(productCode)
            && normalizedRaw.contains("unknown")
            && normalizedRaw.contains("vegetable")
            && !normalizedRaw.contains("oil")
            && !needsHumanReview
            && confidence.compareTo(HUMAN_REVIEW_CONFIDENCE_THRESHOLD) >= 0;
    }

    private ProductNormalizeResponse fallback(ProductNormalizeRequest request, DifyWorkflowErrorCode errorCode) {
        log.warn(
            "Dify product normalizer fallback used. workflowType={} errorCode={}",
            DifyWorkflowType.PRODUCT_NORMALIZER,
            errorCode
        );
        return fallbackProvider.normalize(request);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replace("'", "")
            .replace("`", "")
            .replaceAll("[^\\p{L}\\p{Nd}]+", " ")
            .trim()
            .replaceAll("\\s+", " ");
    }
}

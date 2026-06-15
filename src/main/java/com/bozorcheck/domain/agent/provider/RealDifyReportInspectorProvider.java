package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.agent.dto.AgentSafetyFlags;
import com.bozorcheck.domain.agent.dto.ProductNormalizeRequest;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;
import com.bozorcheck.domain.agent.dto.ReportInspectRequest;
import com.bozorcheck.domain.agent.dto.ReportInspectResponse;
import com.bozorcheck.domain.price.PriceService;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import com.bozorcheck.infra.dify.DifyWorkflowClient;
import com.bozorcheck.infra.dify.DifyWorkflowErrorCode;
import com.bozorcheck.infra.dify.DifyWorkflowException;
import com.bozorcheck.infra.dify.DifyWorkflowType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Primary
@Component
@ConditionalOnProperty(name = "agent.dify.enabled", havingValue = "true")
public class RealDifyReportInspectorProvider implements ReportInspectorProvider {

    private static final Logger log = LoggerFactory.getLogger(RealDifyReportInspectorProvider.class);
    private static final AgentSafetyFlags DIFY_SAFETY_FLAGS = new AgentSafetyFlags(true, true, true, true, true);
    private static final Set<String> ALLOWED_RISK_LEVELS = Set.of("LOW", "MEDIUM", "HIGH");
    private static final Set<String> ALLOWED_STATUS_SUGGESTIONS = Set.of(
        "PENDING",
        "REVIEW_REQUIRED",
        "FLAGGED",
        "REJECT_CANDIDATE"
    );
    private static final Pattern FORBIDDEN_COPY = Pattern.compile(
        "scam|fraud|rip-off|cheating|bad seller|do not buy|\\uBC14\\uAC00\\uC9C0|\\uC0AC\\uAE30|" +
            "\\uC18D\\uC558\\uB2E4|\\uC0AC\\uC9C0\\s*\\uB9C8\\uC138\\uC694|" +
            "\\uC0C1\\uC778\\uC774\\s*\\uC798\\uBABB",
        Pattern.CASE_INSENSITIVE
    );
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };

    private final DifyWorkflowClient difyWorkflowClient;
    private final MockReportInspectorProvider fallbackProvider;
    private final ProductNormalizerProvider productNormalizerProvider;
    private final PriceService priceService;
    private final ObjectMapper objectMapper;

    public RealDifyReportInspectorProvider(
        DifyWorkflowClient difyWorkflowClient,
        MockReportInspectorProvider fallbackProvider,
        ProductNormalizerProvider productNormalizerProvider,
        PriceService priceService,
        ObjectMapper objectMapper
    ) {
        this.difyWorkflowClient = difyWorkflowClient;
        this.fallbackProvider = fallbackProvider;
        this.productNormalizerProvider = productNormalizerProvider;
        this.priceService = priceService;
        this.objectMapper = objectMapper;
    }

    @Override
    public ReportInspectResponse inspect(ReportInspectRequest request) {
        try {
            String productCode = resolveProductCode(request);
            if (!StringUtils.hasText(productCode)) {
                return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
            }
            PriceSummaryResponse summary = findSummary(productCode, request.marketCode());
            if (summary == null) {
                return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
            }

            Map<String, Object> outputs = difyWorkflowClient.runWorkflow(
                DifyWorkflowType.REPORT_INSPECTOR,
                difyInputs(request, productCode, summary),
                "report-inspector"
            );
            return mapOutputs(request, productCode, summary, outputs);
        } catch (DifyWorkflowException exception) {
            return fallback(request, exception.errorCode());
        } catch (RuntimeException exception) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }
    }

    private String resolveProductCode(ReportInspectRequest request) {
        if (StringUtils.hasText(request.productCode())) {
            return request.productCode().trim();
        }
        if (!StringUtils.hasText(request.rawProductName())) {
            return null;
        }
        ProductNormalizeResponse normalized = productNormalizerProvider.normalize(
            new ProductNormalizeRequest(request.rawProductName(), request.locale())
        );
        return normalized.needsHumanReview() ? null : normalized.standardProductCode();
    }

    private PriceSummaryResponse findSummary(String productCode, String marketCode) {
        try {
            return priceService.getSummary(productCode, marketCode, null);
        } catch (ApiException exception) {
            if (exception.errorCode() == ErrorCode.PRICE_SUMMARY_NOT_FOUND) {
                return null;
            }
            throw exception;
        }
    }

    private Map<String, Object> difyInputs(
        ReportInspectRequest request,
        String productCode,
        PriceSummaryResponse summary
    ) {
        Map<String, Object> inputs = new LinkedHashMap<>();
        inputs.put("rawProductName", StringUtils.hasText(request.rawProductName()) ? request.rawProductName() : productCode);
        inputs.put("productCode", productCode);
        inputs.put("marketCode", request.marketCode());
        inputs.put("submittedPrice", request.submittedPrice());
        inputs.put("submittedUnit", request.submittedUnit());
        inputs.put("recentFairLow", summary.fairLow());
        inputs.put("recentFairMid", summary.fairMid());
        inputs.put("recentFairHigh", summary.fairHigh());
        inputs.put("confidenceScore", summary.confidenceScore());
        inputs.put("sampleCount", summary.sampleCount());
        inputs.put("sourceBreakdownJson", jsonOrEmptyObject(summary.sourceBreakdown()));
        inputs.put("surveyDate", summary.surveyDate() == null ? "" : summary.surveyDate());
        inputs.put("locale", StringUtils.hasText(request.locale()) ? request.locale() : "en");
        inputs.put("matchConfidence", BigDecimal.ONE);
        return inputs;
    }

    private String jsonOrEmptyObject(Map<String, Object> value) {
        if (value == null || value.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return "{}";
        }
    }

    private ReportInspectResponse mapOutputs(
        ReportInspectRequest request,
        String productCode,
        PriceSummaryResponse summary,
        Map<String, Object> outputs
    ) {
        String riskLevel = requiredString(outputs, "riskLevel").toUpperCase(Locale.ROOT);
        if (!ALLOWED_RISK_LEVELS.contains(riskLevel)) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }

        String statusSuggestion = requiredString(outputs, "statusSuggestion").toUpperCase(Locale.ROOT);
        boolean approvedWasCorrected = false;
        if ("APPROVED".equals(statusSuggestion)) {
            statusSuggestion = "REVIEW_REQUIRED";
            approvedWasCorrected = true;
        } else if (!ALLOWED_STATUS_SUGGESTIONS.contains(statusSuggestion)) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }

        boolean needsHumanReview = requiredBoolean(outputs.get("needsHumanReview"));
        if (approvedWasCorrected || !"PENDING".equals(statusSuggestion)) {
            needsHumanReview = true;
        }

        String normalizedProductCode = optionalString(outputs, "normalizedProductCode", productCode);
        if (!productCode.equals(normalizedProductCode)) {
            return fallback(request, DifyWorkflowErrorCode.INVALID_RESPONSE);
        }

        List<String> anomalyReasons = sanitizeList(optionalStringList(outputs, "anomalyReasonsJson"));
        validateOptionalStringList(outputs, "operatorChecklistJson");
        String reviewNote = sanitize(requiredString(outputs, "reviewNote"));
        String userMessage = sanitize(requiredString(outputs, "userMessage"));

        return new ReportInspectResponse(
            productCode,
            riskLevel,
            statusSuggestion,
            needsHumanReview,
            anomalyReasons,
            reviewNote,
            userMessage,
            AgentProviderSupport.sourceSummary(summary),
            DIFY_SAFETY_FLAGS
        );
    }

    private String requiredString(Map<String, Object> outputs, String key) {
        Object value = outputs.get(key);
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            return stringValue.trim();
        }
        throw new DifyWorkflowException(
            DifyWorkflowErrorCode.INVALID_RESPONSE,
            "Dify report inspector output was missing " + key + "."
        );
    }

    private String optionalString(Map<String, Object> outputs, String key, String defaultValue) {
        Object value = outputs.get(key);
        if (value instanceof String stringValue && StringUtils.hasText(stringValue)) {
            return stringValue.trim();
        }
        return defaultValue;
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
        throw new DifyWorkflowException(
            DifyWorkflowErrorCode.INVALID_RESPONSE,
            "Dify report inspector review flag was missing or malformed."
        );
    }

    private List<String> optionalStringList(Map<String, Object> outputs, String key) {
        Object value = outputs.get(key);
        if (value == null) {
            return List.of();
        }
        if (value instanceof List<?> listValue) {
            return listValue.stream().map(Object::toString).toList();
        }
        if (value instanceof String stringValue) {
            if (!StringUtils.hasText(stringValue)) {
                return List.of();
            }
            try {
                return objectMapper.readValue(stringValue, STRING_LIST);
            } catch (JsonProcessingException exception) {
                throw new DifyWorkflowException(
                    DifyWorkflowErrorCode.INVALID_RESPONSE,
                    "Dify report inspector list output was not valid JSON.",
                    exception
                );
            }
        }
        throw new DifyWorkflowException(
            DifyWorkflowErrorCode.INVALID_RESPONSE,
            "Dify report inspector list output was malformed."
        );
    }

    private void validateOptionalStringList(Map<String, Object> outputs, String key) {
        optionalStringList(outputs, key);
    }

    private List<String> sanitizeList(List<String> values) {
        return values.stream()
            .map(this::sanitize)
            .filter(StringUtils::hasText)
            .toList();
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return FORBIDDEN_COPY.matcher(value).replaceAll("needs manual review");
    }

    private ReportInspectResponse fallback(ReportInspectRequest request, DifyWorkflowErrorCode errorCode) {
        log.warn(
            "Dify report inspector fallback used. workflowType={} errorCode={}",
            DifyWorkflowType.REPORT_INSPECTOR,
            errorCode
        );
        return fallbackProvider.inspect(request);
    }
}

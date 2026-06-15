package com.bozorcheck.domain.agent.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bozorcheck.common.enums.SummaryGrain;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;
import com.bozorcheck.domain.agent.dto.ReportInspectRequest;
import com.bozorcheck.domain.agent.dto.ReportInspectResponse;
import com.bozorcheck.domain.price.PriceService;
import com.bozorcheck.domain.price.dto.PriceSummaryResponse;
import com.bozorcheck.infra.dify.DifyWorkflowClient;
import com.bozorcheck.infra.dify.DifyWorkflowErrorCode;
import com.bozorcheck.infra.dify.DifyWorkflowException;
import com.bozorcheck.infra.dify.DifyWorkflowType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class RealDifyReportInspectorProviderTest {

    private DifyWorkflowClient difyWorkflowClient;
    private ProductNormalizerProvider productNormalizerProvider;
    private PriceService priceService;
    private RealDifyReportInspectorProvider provider;

    @BeforeEach
    void setUp() {
        difyWorkflowClient = mock(DifyWorkflowClient.class);
        productNormalizerProvider = mock(ProductNormalizerProvider.class);
        priceService = mock(PriceService.class);
        MockReportInspectorProvider fallbackProvider = new MockReportInspectorProvider(
            productNormalizerProvider,
            priceService
        );
        provider = new RealDifyReportInspectorProvider(
            difyWorkflowClient,
            fallbackProvider,
            productNormalizerProvider,
            priceService,
            new ObjectMapper()
        );
        when(priceService.getSummary("RICE", "TASHKENT_CHORSU", null)).thenReturn(summary());
        when(productNormalizerProvider.normalize(any())).thenReturn(new ProductNormalizeResponse(
            "guruch",
            "RICE",
            "Rice",
            "STANDARD",
            new BigDecimal("0.91"),
            false,
            java.util.List.of("guruch"),
            "Matched rice."
        ));
    }

    @Test
    @SuppressWarnings("unchecked")
    void mapsSuccessfulDifyOutputToResponse() {
        whenDifyReturns(Map.of(
            "normalizedProductCode", "RICE",
            "riskLevel", "MEDIUM",
            "statusSuggestion", "REVIEW_REQUIRED",
            "needsHumanReview", true,
            "anomalyReasonsJson", "[\"Submitted price is above backend fair high.\"]",
            "reviewNote", "Review this report before use.",
            "userMessage", "Thanks for the report. It needs a short review.",
            "operatorChecklistJson", "[\"Compare with recent backend fair range.\"]"
        ));

        ReportInspectResponse response = provider.inspect(request("RICE", "guruch", new BigDecimal("18000")));

        assertThat(response.normalizedProductCode()).isEqualTo("RICE");
        assertThat(response.riskLevel()).isEqualTo("MEDIUM");
        assertThat(response.statusSuggestion()).isEqualTo("REVIEW_REQUIRED");
        assertThat(response.needsHumanReview()).isTrue();
        assertThat(response.anomalyReasons()).containsExactly("Submitted price is above backend fair high.");
        assertThat(response.reviewNote()).isEqualTo("Review this report before use.");
        assertThat(response.safetyFlags().difyConnected()).isTrue();
        assertThat(response.sourceSummary().productCode()).isEqualTo("RICE");

        ArgumentCaptor<Map<String, Object>> inputsCaptor = ArgumentCaptor.forClass(Map.class);
        verify(difyWorkflowClient).runWorkflow(
            eq(DifyWorkflowType.REPORT_INSPECTOR),
            inputsCaptor.capture(),
            eq("report-inspector")
        );
        Map<String, Object> inputs = inputsCaptor.getValue();
        assertThat(inputs)
            .containsEntry("rawProductName", "guruch")
            .containsEntry("productCode", "RICE")
            .containsEntry("marketCode", "TASHKENT_CHORSU")
            .containsEntry("submittedUnit", "KG")
            .containsEntry("sampleCount", 1)
            .containsEntry("surveyDate", "2026-06-05")
            .containsEntry("locale", "ko")
            .containsEntry("matchConfidence", BigDecimal.ONE);
        assertThat(inputs.get("sourceBreakdownJson").toString()).contains("FIELD_SURVEY");
    }

    @Test
    void approvedStatusIsNeverAllowed() {
        whenDifyReturns(Map.of(
            "normalizedProductCode", "RICE",
            "riskLevel", "LOW",
            "statusSuggestion", "APPROVED",
            "needsHumanReview", false,
            "reviewNote", "Looks normal.",
            "userMessage", "Thanks for the report.",
            "anomalyReasonsJson", "[]"
        ));

        ReportInspectResponse response = provider.inspect(request("RICE", "guruch", new BigDecimal("15000")));

        assertThat(response.statusSuggestion()).isEqualTo("REVIEW_REQUIRED");
        assertThat(response.needsHumanReview()).isTrue();
    }

    @Test
    void flaggedForcesHumanReview() {
        whenDifyReturns(Map.of(
            "normalizedProductCode", "RICE",
            "riskLevel", "HIGH",
            "statusSuggestion", "FLAGGED",
            "needsHumanReview", false,
            "reviewNote", "Manual review required.",
            "userMessage", "Thanks for the report. We will check it carefully.",
            "anomalyReasonsJson", "[\"Far from backend fair range.\"]"
        ));

        ReportInspectResponse response = provider.inspect(request("RICE", "guruch", new BigDecimal("22000")));

        assertThat(response.statusSuggestion()).isEqualTo("FLAGGED");
        assertThat(response.needsHumanReview()).isTrue();
    }

    @Test
    void difyExceptionFallsBackToMock() {
        when(difyWorkflowClient.runWorkflow(eq(DifyWorkflowType.REPORT_INSPECTOR), any(), eq("report-inspector")))
            .thenThrow(new DifyWorkflowException(DifyWorkflowErrorCode.TIMEOUT, "timeout"));

        ReportInspectResponse response = provider.inspect(request("RICE", "guruch", new BigDecimal("18000")));

        assertThat(response.riskLevel()).isEqualTo("MEDIUM");
        assertThat(response.statusSuggestion()).isEqualTo("REVIEW_REQUIRED");
        assertThat(response.safetyFlags().difyConnected()).isFalse();
    }

    @Test
    void invalidRiskLevelFallsBack() {
        whenDifyReturns(Map.of(
            "normalizedProductCode", "RICE",
            "riskLevel", "CRITICAL",
            "statusSuggestion", "REVIEW_REQUIRED",
            "needsHumanReview", true,
            "reviewNote", "Review.",
            "userMessage", "Thanks.",
            "anomalyReasonsJson", "[]"
        ));

        ReportInspectResponse response = provider.inspect(request("RICE", "guruch", new BigDecimal("18000")));

        assertThat(response.riskLevel()).isEqualTo("MEDIUM");
        assertThat(response.statusSuggestion()).isEqualTo("REVIEW_REQUIRED");
        assertThat(response.safetyFlags().difyConnected()).isFalse();
    }

    @Test
    void forbiddenCopyIsSanitized() {
        whenDifyReturns(Map.of(
            "normalizedProductCode", "RICE",
            "riskLevel", "HIGH",
            "statusSuggestion", "FLAGGED",
            "needsHumanReview", true,
            "reviewNote", "This is a scam and bad seller case.",
            "userMessage", "Do not buy because this looks like fraud.",
            "anomalyReasonsJson", "[\"Possible rip-off\", \"Seller cheating\"]"
        ));

        ReportInspectResponse response = provider.inspect(request("RICE", "guruch", new BigDecimal("22000")));
        String joined = String.join(" ", response.reviewNote(), response.userMessage(), String.join(" ", response.anomalyReasons()));

        assertThat(joined.toLowerCase()).doesNotContain("scam", "fraud", "rip-off", "cheating", "bad seller", "do not buy");
        assertThat(response.statusSuggestion()).isEqualTo("FLAGGED");
        assertThat(response.needsHumanReview()).isTrue();
    }

    private void whenDifyReturns(Map<String, Object> outputs) {
        when(difyWorkflowClient.runWorkflow(eq(DifyWorkflowType.REPORT_INSPECTOR), any(), eq("report-inspector")))
            .thenReturn(outputs);
    }

    private ReportInspectRequest request(String productCode, String rawProductName, BigDecimal submittedPrice) {
        return new ReportInspectRequest(
            productCode,
            rawProductName,
            "TASHKENT_CHORSU",
            submittedPrice,
            "KG",
            "ko"
        );
    }

    private PriceSummaryResponse summary() {
        return new PriceSummaryResponse(
            "RICE",
            "Rice",
            "TASHKENT_CHORSU",
            "Chorsu Bazaar",
            LocalDate.of(2026, 6, 5),
            SummaryGrain.DAILY,
            new BigDecimal("14300"),
            new BigDecimal("15000"),
            new BigDecimal("15800"),
            new BigDecimal("14300"),
            new BigDecimal("15800"),
            1,
            new BigDecimal("0.580"),
            Map.of("FIELD_SURVEY", 1),
            OffsetDateTime.parse("2026-06-05T10:00:00Z"),
            "2026-06-05",
            "Chorsu Bazaar and Korzinka, Tashkent",
            "FIELD_SURVEY",
            "Local survey reference."
        );
    }
}

package com.bozorcheck.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import com.bozorcheck.infra.dify.DifyWorkflowClient;
import com.bozorcheck.infra.dify.DifyWorkflowType;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@TestPropertySource(properties = "agent.dify.enabled=true")
class AgentApiDifyReportInspectorTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DifyWorkflowClient difyWorkflowClient;

    @Test
    @SuppressWarnings("unchecked")
    void reportInspectUsesRealProviderWhenDifyEnabled() throws Exception {
        when(difyWorkflowClient.runWorkflow(eq(DifyWorkflowType.REPORT_INSPECTOR), org.mockito.ArgumentMatchers.any(), eq("report-inspector")))
            .thenReturn(Map.of(
                "normalizedProductCode", "RICE",
                "riskLevel", "MEDIUM",
                "statusSuggestion", "REVIEW_REQUIRED",
                "needsHumanReview", true,
                "anomalyReasonsJson", "[\"Submitted price is above backend fair high.\"]",
                "reviewNote", "Review this report before use.",
                "userMessage", "Thanks for the report. It needs a short review.",
                "operatorChecklistJson", "[\"Compare with backend fair range.\"]"
            ));

        mockMvc.perform(post("/api/v1/agent/report-inspect")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "rawProductName": "guruch",
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "submittedPrice": 18000,
                      "submittedUnit": "KG",
                      "locale": "ko"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.normalizedProductCode").value("RICE"))
            .andExpect(jsonPath("$.data.riskLevel").value("MEDIUM"))
            .andExpect(jsonPath("$.data.statusSuggestion").value("REVIEW_REQUIRED"))
            .andExpect(jsonPath("$.data.needsHumanReview").value(true))
            .andExpect(jsonPath("$.data.safetyFlags.difyConnected").value(true))
            .andExpect(jsonPath("$.data.safetyFlags.noAutoApproval").value(true));

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
            .containsEntry("surveyDate", "2026-06-05")
            .containsEntry("locale", "ko");
        assertThat(inputs.get("sourceBreakdownJson").toString()).contains("FIELD_SURVEY");
    }

    @Test
    void productNormalizerStillWorksWhenReportInspectorIsEnabled() throws Exception {
        when(difyWorkflowClient.runWorkflow(eq(DifyWorkflowType.PRODUCT_NORMALIZER), org.mockito.ArgumentMatchers.any(), eq("product-normalizer")))
            .thenReturn(Map.of(
                "standardProductCode", "TOMATO",
                "standardProductName", "Tomato",
                "variant", "PINK_GREENHOUSE",
                "normalizedUnitCode", "KG",
                "matchConfidence", 0.91,
                "needsHumanReview", false,
                "reason", "Matched through Dify workflow."
            ));

        mockMvc.perform(post("/api/v1/agent/product-normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "rawProductName": "pink greenhouse pomidor",
                      "locale": "en"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.standardProductCode").value("TOMATO"))
            .andExpect(jsonPath("$.data.variant").value("PINK_GREENHOUSE"))
            .andExpect(jsonPath("$.data.needsHumanReview").value(false));
    }

    @Test
    void priceInsightStillMockBackedWhenDifyEnabled() throws Exception {
        mockMvc.perform(post("/api/v1/agent/price-insight")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "quotedPrice": 18000,
                      "unitCode": "KG"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verdict").value("EXPENSIVE"))
            .andExpect(jsonPath("$.data.safetyFlags.difyConnected").value(false))
            .andExpect(jsonPath("$.data.safetyFlags.noAiGeneratedFairPrice").value(true))
            .andExpect(jsonPath("$.data.statusSuggestion").doesNotExist());

        mockMvc.perform(post("/api/v1/agent/report-inspect")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "submittedPrice": 15000,
                      "submittedUnit": "KG",
                      "locale": "en"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.statusSuggestion").value(not("APPROVED")));
    }
}

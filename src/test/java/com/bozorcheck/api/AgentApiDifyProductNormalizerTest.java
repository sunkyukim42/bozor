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
class AgentApiDifyProductNormalizerTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DifyWorkflowClient difyWorkflowClient;

    @Test
    @SuppressWarnings("unchecked")
    void productNormalizeUsesRealProviderWhenDifyEnabled() throws Exception {
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
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.standardProductCode").value("TOMATO"))
            .andExpect(jsonPath("$.data.variant").value("PINK_GREENHOUSE"))
            .andExpect(jsonPath("$.data.matchConfidence").value(0.91))
            .andExpect(jsonPath("$.data.needsHumanReview").value(false));

        ArgumentCaptor<Map<String, Object>> inputsCaptor = ArgumentCaptor.forClass(Map.class);
        verify(difyWorkflowClient).runWorkflow(
            eq(DifyWorkflowType.PRODUCT_NORMALIZER),
            inputsCaptor.capture(),
            eq("product-normalizer")
        );
        Map<String, Object> inputs = inputsCaptor.getValue();
        assertThat(inputs)
            .containsEntry("rawProductName", "pink greenhouse pomidor")
            .containsEntry("locale", "en")
            .containsEntry("marketCode", "")
            .containsEntry("unitText", "")
            .containsEntry("userContext", "search");
        assertThat((String) inputs.get("knownAliasesJson")).contains("TOMATO", "pomidor");
    }

    @Test
    void reportAndPriceInsightRemainMockBackedWhenDifyEnabled() throws Exception {
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
            .andExpect(jsonPath("$.data.statusSuggestion").value(not("APPROVED")))
            .andExpect(jsonPath("$.data.safetyFlags.noAutoApproval").value(true))
            .andExpect(jsonPath("$.data.safetyFlags.difyConnected").value(false));

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
            .andExpect(jsonPath("$.data.safetyFlags.noAiGeneratedFairPrice").value(true))
            .andExpect(jsonPath("$.data.safetyFlags.difyConnected").value(false));
    }
}

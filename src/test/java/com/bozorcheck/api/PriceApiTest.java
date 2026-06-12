package com.bozorcheck.api;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class PriceApiTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void summaryReturnsLatestSeedSummary() throws Exception {
        mockMvc.perform(get("/api/v1/prices/summary").param("productCode", "TOMATO"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.productCode").value("TOMATO"))
            .andExpect(jsonPath("$.data.marketCode").value("TASHKENT_CHORSU"))
            .andExpect(jsonPath("$.data.summaryDate").value("2026-06-05"))
            .andExpect(jsonPath("$.data.surveyDate").value("2026-06-05"));
    }

    @Test
    void surveySummariesReturnMetadataAndFairBands() throws Exception {
        mockMvc.perform(get("/api/v1/prices/summary")
                .param("productCode", "RICE")
                .param("marketCode", "TASHKENT_CHORSU")
                .param("date", "2026-06-05"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.productCode").value("RICE"))
            .andExpect(jsonPath("$.data.fairLow").value(14300.0))
            .andExpect(jsonPath("$.data.fairMid").value(15000.0))
            .andExpect(jsonPath("$.data.fairHigh").value(15800.0))
            .andExpect(jsonPath("$.data.sampleCount").value(1))
            .andExpect(jsonPath("$.data.sourceBreakdown.FIELD_SURVEY").value(1))
            .andExpect(jsonPath("$.data.surveyDate").value("2026-06-05"))
            .andExpect(jsonPath("$.data.location").value("Chorsu Bazaar and Korzinka, Tashkent"))
            .andExpect(jsonPath("$.data.dataSource").value("FIELD_SURVEY"));

        mockMvc.perform(get("/api/v1/prices/summary")
                .param("productCode", "EGGS")
                .param("marketCode", "TASHKENT_CHORSU")
                .param("date", "2026-06-05"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.productCode").value("EGGS"))
            .andExpect(jsonPath("$.data.fairLow").value(15000.0))
            .andExpect(jsonPath("$.data.fairMid").value(16000.0))
            .andExpect(jsonPath("$.data.fairHigh").value(17000.0))
            .andExpect(jsonPath("$.data.dataNote").value("Chorsu field survey range was 15,000-17,000 UZS per 10 pcs."));
    }

    @Test
    void checkReturnsDeterministicVerdict() throws Exception {
        mockMvc.perform(post("/api/v1/prices/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "TOMATO",
                      "marketCode": "TASHKENT_CHORSU",
                      "quotedPrice": 22000,
                      "unitCode": "KG"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verdict", is("VERY_EXPENSIVE")))
            .andExpect(jsonPath("$.data.recommendedTargetPrice").exists())
            .andExpect(jsonPath("$.data.sampleCount").value(1))
            .andExpect(jsonPath("$.data.sourceBreakdown.FIELD_SURVEY").value(1))
            .andExpect(jsonPath("$.data.surveyDate").value("2026-06-05"))
            .andExpect(jsonPath("$.data.location").value("Chorsu Bazaar and Korzinka, Tashkent"))
            .andExpect(jsonPath("$.data.dataSource").value("FIELD_SURVEY"));
    }

    @Test
    void checkRejectsNonPositiveQuotedPrice() throws Exception {
        mockMvc.perform(post("/api/v1/prices/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "TOMATO",
                      "marketCode": "TASHKENT_CHORSU",
                      "quotedPrice": 0,
                      "unitCode": "KG"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }
}

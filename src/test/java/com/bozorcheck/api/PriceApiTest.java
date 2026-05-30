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
            .andExpect(jsonPath("$.data.marketCode").value("TASHKENT_CHORSU"));
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
            .andExpect(jsonPath("$.data.recommendedTargetPrice").exists());
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

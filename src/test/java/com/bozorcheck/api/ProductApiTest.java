package com.bozorcheck.api;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

class ProductApiTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void productsReturnOk() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[*].code", hasItems("TOMATO", "RICE", "EGGS", "VEGETABLE_OIL", "BEEF")));
    }

    @Test
    void querySearchIncludesTomato() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("query", "tomato"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("TOMATO")));

        mockMvc.perform(get("/api/v1/products").param("query", "pomidor"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("TOMATO")));
    }

    @Test
    void querySearchIncludesTomatoLanguageAndVariantAliases() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("query", "помидор"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("TOMATO")));

        mockMvc.perform(get("/api/v1/products").param("query", "pink greenhouse pomidor"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("TOMATO")));
    }

    @Test
    void querySearchIncludesLocalSurveyAliases() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("query", "rice"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("RICE")));

        mockMvc.perform(get("/api/v1/products").param("query", "guruch"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("RICE")));

        mockMvc.perform(get("/api/v1/products").param("query", "tuxum"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("EGGS")));

        mockMvc.perform(get("/api/v1/products").param("query", "mol go'shti"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("BEEF")));
    }

    @Test
    void unknownQueryDoesNotOvermatchVegetableOil() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("query", "unknown local vegetable"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", not(hasItem("VEGETABLE_OIL"))));
    }

    @Test
    void missingProductReturnsNotFoundCode() throws Exception {
        mockMvc.perform(get("/api/v1/products/{productId}", UUID.randomUUID()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }
}

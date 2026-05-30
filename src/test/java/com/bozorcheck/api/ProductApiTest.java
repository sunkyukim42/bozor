package com.bozorcheck.api;

import static org.hamcrest.Matchers.hasItem;
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
            .andExpect(jsonPath("$.data[*].code", hasItem("TOMATO")));
    }

    @Test
    void querySearchIncludesTomato() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("query", "tomato"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem("TOMATO")));
    }

    @Test
    void missingProductReturnsNotFoundCode() throws Exception {
        mockMvc.perform(get("/api/v1/products/{productId}", UUID.randomUUID()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }
}

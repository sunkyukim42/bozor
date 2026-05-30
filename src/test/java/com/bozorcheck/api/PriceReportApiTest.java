package com.bozorcheck.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import com.bozorcheck.common.util.HashUtils;
import com.bozorcheck.domain.user.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class PriceReportApiTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void reportCreatesPendingReportAndStoresOnlyAnonymousKeyHash() throws Exception {
        String anonymousKey = "test-anonymous-key";
        String expectedHash = HashUtils.sha256Hex(anonymousKey);

        mockMvc.perform(post("/api/v1/reports")
                .header("X-Anonymous-Key", anonymousKey)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "TOMATO",
                      "marketCode": "TASHKENT_CHORSU",
                      "rawProductName": "pomidor",
                      "submittedPrice": 16000,
                      "submittedUnit": "KG",
                      "photoUrl": null,
                      "latitude": 41.3265,
                      "longitude": 69.2286
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("PENDING"))
            .andExpect(jsonPath("$.data.productCode").value("TOMATO"));

        assertThat(appUserRepository.findByAnonymousKeyHash(expectedHash)).isPresent();
        assertThat(appUserRepository.findByAnonymousKeyHash(anonymousKey)).isEmpty();
    }
}

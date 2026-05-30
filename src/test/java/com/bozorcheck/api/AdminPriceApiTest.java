package com.bozorcheck.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import com.bozorcheck.domain.price.PriceObservationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class AdminPriceApiTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PriceObservationRepository priceObservationRepository;

    @Test
    void adminCreatesApprovedObservation() throws Exception {
        long before = priceObservationRepository.count();

        mockMvc.perform(post("/api/v1/admin/price-observations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "TOMATO",
                      "marketCode": "TASHKENT_CHORSU",
                      "sourceCode": "FIELD_SURVEY",
                      "observedAt": "%s",
                      "priceAmount": 16000,
                      "currency": "UZS",
                      "unitCode": "KG",
                      "normalizedPricePerKg": 16000,
                      "qualityGrade": "STANDARD",
                      "status": "APPROVED",
                      "trustScore": 0.8,
                      "rawPayload": {"note": "manual field survey"}
                    }
                    """.formatted(OffsetDateTime.now())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("APPROVED"));

        assertThat(priceObservationRepository.count()).isEqualTo(before + 1);
    }

    @Test
    void adminApproveCreatesObservationAndBlocksSecondApprove() throws Exception {
        MvcResult reportResult = mockMvc.perform(post("/api/v1/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "TOMATO",
                      "marketCode": "TASHKENT_CHORSU",
                      "rawProductName": "pomidor",
                      "submittedPrice": 16000,
                      "submittedUnit": "KG"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();
        JsonNode reportJson = objectMapper.readTree(reportResult.getResponse().getContentAsString());
        String reportId = reportJson.path("data").path("id").asText();

        mockMvc.perform(post("/api/v1/admin/reports/{reportId}/approve", reportId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "sourceCode": "USER_REPORT",
                      "trustScore": 0.6,
                      "qualityGrade": "STANDARD",
                      "normalizedPricePerKg": 16000,
                      "reviewNote": "Looks valid from photo and location."
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("APPROVED"))
            .andExpect(jsonPath("$.data.normalizedObservationId").isNotEmpty());

        mockMvc.perform(post("/api/v1/admin/reports/{reportId}/approve", reportId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "sourceCode": "USER_REPORT",
                      "trustScore": 0.6,
                      "qualityGrade": "STANDARD",
                      "normalizedPricePerKg": 16000
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("INVALID_STATUS_TRANSITION"));
    }
}

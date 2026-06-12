package com.bozorcheck.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.isA;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bozorcheck.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class AgentApiTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void productNormalizeMatchesTomatoVariant() throws Exception {
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
            .andExpect(jsonPath("$.data.needsHumanReview").value(false))
            .andExpect(jsonPath("$.data.matchedAliases", hasItem("pomidor")));
    }

    @Test
    void productNormalizeMatchesTuxumToEggs() throws Exception {
        mockMvc.perform(post("/api/v1/agent/product-normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "rawProductName": "tuxum",
                      "locale": "uz"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.standardProductCode").value("EGGS"))
            .andExpect(jsonPath("$.data.variant").value("STANDARD"))
            .andExpect(jsonPath("$.data.needsHumanReview").value(false));
    }

    @Test
    void productNormalizeUnknownLocalVegetableRequiresHumanReview() throws Exception {
        mockMvc.perform(post("/api/v1/agent/product-normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "rawProductName": "unknown local vegetable",
                      "locale": "en"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.standardProductCode").value(nullValue()))
            .andExpect(jsonPath("$.data.variant").value("UNKNOWN"))
            .andExpect(jsonPath("$.data.matchConfidence").value(lessThanOrEqualTo(0.4)))
            .andExpect(jsonPath("$.data.needsHumanReview").value(true))
            .andExpect(jsonPath("$.data.matchedAliases").isEmpty());
    }

    @Test
    void productNormalizeVegetableOnlyDoesNotConfidentlyMatchVegetableOil() throws Exception {
        mockMvc.perform(post("/api/v1/agent/product-normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "rawProductName": "vegetable",
                      "locale": "en"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.standardProductCode").value(nullValue()))
            .andExpect(jsonPath("$.data.matchConfidence").value(lessThanOrEqualTo(0.4)))
            .andExpect(jsonPath("$.data.needsHumanReview").value(true));
    }

    @Test
    void productNormalizeSunflowerOilMatchesVegetableOil() throws Exception {
        mockMvc.perform(post("/api/v1/agent/product-normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "rawProductName": "sunflower oil",
                      "locale": "en"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.standardProductCode").value("VEGETABLE_OIL"))
            .andExpect(jsonPath("$.data.matchConfidence").value(0.95))
            .andExpect(jsonPath("$.data.needsHumanReview").value(false))
            .andExpect(jsonPath("$.data.matchedAliases", hasItem("sunflower oil")));
    }

    @Test
    void reportInspectSuggestsReviewForRiceAboveFairRange() throws Exception {
        mockMvc.perform(post("/api/v1/agent/report-inspect")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "submittedPrice": 18000,
                      "submittedUnit": "KG",
                      "locale": "en"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.normalizedProductCode").value("RICE"))
            .andExpect(jsonPath("$.data.riskLevel").value("MEDIUM"))
            .andExpect(jsonPath("$.data.statusSuggestion").value("REVIEW_REQUIRED"))
            .andExpect(jsonPath("$.data.needsHumanReview").value(true))
            .andExpect(jsonPath("$.data.sourceSummary.productCode").value("RICE"))
            .andExpect(jsonPath("$.data.safetyFlags.noAutoApproval").value(true));
    }

    @Test
    void reportInspectNeverSuggestsApproved() throws Exception {
        mockMvc.perform(post("/api/v1/agent/report-inspect")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "submittedPrice": 15000,
                      "submittedUnit": "KG",
                      "locale": "ko"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.normalizedProductCode").value("RICE"))
            .andExpect(jsonPath("$.data.statusSuggestion").value(not("APPROVED")))
            .andExpect(jsonPath("$.data.statusSuggestion").value("PENDING"))
            .andExpect(jsonPath("$.data.needsHumanReview").value(false));
    }

    @Test
    void reportInspectRejectsInvalidPriceWithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/agent/report-inspect")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "submittedPrice": 0,
                      "submittedUnit": "KG"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    void priceInsightUsesBackendVerdictAndSafetyFlags() throws Exception {
        mockMvc.perform(post("/api/v1/agent/price-insight")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "quotedPrice": 18000,
                      "unitCode": "KG",
                      "includeBargainPhrase": true
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verdict").value("EXPENSIVE"))
            .andExpect(jsonPath("$.data.fairLow").value(14300.0))
            .andExpect(jsonPath("$.data.fairHigh").value(15800.0))
            .andExpect(jsonPath("$.data.safetyFlags.noAiGeneratedFairPrice").value(true))
            .andExpect(jsonPath("$.data.safetyFlags.difyConnected").value(false))
            .andExpect(jsonPath("$.data.bargainPhrase").exists());
    }

    @Test
    void priceInsightAcceptsIncludeOptionalPhraseAlias() throws Exception {
        mockMvc.perform(post("/api/v1/agent/price-insight")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productCode": "RICE",
                      "marketCode": "TASHKENT_CHORSU",
                      "quotedPrice": 18000,
                      "unitCode": "KG",
                      "includeOptionalPhrase": true
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verdict").value("EXPENSIVE"))
            .andExpect(jsonPath("$.data.bargainPhrase").exists());
    }

    @Test
    void marketBriefingReturnsHighlightsForChorsuSurveyDate() throws Exception {
        mockMvc.perform(post("/api/v1/agent/market-briefing")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "marketCode": "TASHKENT_CHORSU",
                      "summaryDate": "2026-06-05"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.marketCode").value("TASHKENT_CHORSU"))
            .andExpect(jsonPath("$.data.summaryDate").value("2026-06-05"))
            .andExpect(jsonPath("$.data.briefingTitle").exists())
            .andExpect(jsonPath("$.data.summaryText").exists())
            .andExpect(jsonPath("$.data.highlights[0]").exists())
            .andExpect(jsonPath("$.data.dataWarnings[0]").value(containsString("Field survey")))
            .andExpect(jsonPath("$.data.sourceSummary.sampleCount").value(10));
    }

    @Test
    void fieldSurveyPlanReturnsLowSampleTargets() throws Exception {
        mockMvc.perform(post("/api/v1/agent/field-survey-plan")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "marketCode": "TASHKENT_CHORSU",
                      "summaryDate": "2026-06-05"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.marketCode").value("TASHKENT_CHORSU"))
            .andExpect(jsonPath("$.data.summaryDate").value("2026-06-05"))
            .andExpect(jsonPath("$.data.todaySurveyTargets[*].productCode", hasItem("RICE")))
            .andExpect(jsonPath("$.data.todaySurveyTargets[*].priority", hasItem("HIGH")))
            .andExpect(jsonPath("$.data.recommendedPlan").value(isA(String.class)))
            .andExpect(jsonPath("$.data.recommendedPlan").value(not(emptyString())))
            .andExpect(jsonPath("$.data.recommendedActions[0]").exists())
            .andExpect(jsonPath("$.data.surveyTargets[*].productCode", hasItem("RICE")))
            .andExpect(jsonPath("$.data.surveyTargets[*].priority", hasItem("HIGH")));
    }
}

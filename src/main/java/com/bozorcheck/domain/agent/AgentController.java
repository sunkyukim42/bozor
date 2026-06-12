package com.bozorcheck.domain.agent;

import com.bozorcheck.common.api.ApiResponse;
import com.bozorcheck.domain.agent.dto.FieldSurveyPlanRequest;
import com.bozorcheck.domain.agent.dto.FieldSurveyPlanResponse;
import com.bozorcheck.domain.agent.dto.MarketBriefingRequest;
import com.bozorcheck.domain.agent.dto.MarketBriefingResponse;
import com.bozorcheck.domain.agent.dto.PriceInsightRequest;
import com.bozorcheck.domain.agent.dto.PriceInsightResponse;
import com.bozorcheck.domain.agent.dto.ProductNormalizeRequest;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;
import com.bozorcheck.domain.agent.dto.ReportInspectRequest;
import com.bozorcheck.domain.agent.dto.ReportInspectResponse;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/product-normalize")
    public ApiResponse<ProductNormalizeResponse> normalize(@Valid @RequestBody ProductNormalizeRequest request) {
        return ApiResponse.ok(agentService.normalize(request));
    }

    @PostMapping("/report-inspect")
    public ApiResponse<ReportInspectResponse> inspectReport(@Valid @RequestBody ReportInspectRequest request) {
        return ApiResponse.ok(agentService.inspectReport(request));
    }

    @PostMapping("/price-insight")
    public ApiResponse<PriceInsightResponse> explainPrice(@Valid @RequestBody PriceInsightRequest request) {
        return ApiResponse.ok(agentService.explainPrice(request));
    }

    @PostMapping("/market-briefing")
    public ApiResponse<MarketBriefingResponse> briefMarket(@Valid @RequestBody MarketBriefingRequest request) {
        return ApiResponse.ok(agentService.briefMarket(request));
    }

    @PostMapping("/field-survey-plan")
    public ApiResponse<FieldSurveyPlanResponse> planFieldSurvey(@Valid @RequestBody FieldSurveyPlanRequest request) {
        return ApiResponse.ok(agentService.planFieldSurvey(request));
    }
}

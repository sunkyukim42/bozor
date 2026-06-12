package com.bozorcheck.domain.agent;

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
import com.bozorcheck.domain.agent.provider.FieldSurveyPlannerProvider;
import com.bozorcheck.domain.agent.provider.MarketBriefingProvider;
import com.bozorcheck.domain.agent.provider.PriceInsightProvider;
import com.bozorcheck.domain.agent.provider.ProductNormalizerProvider;
import com.bozorcheck.domain.agent.provider.ReportInspectorProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgentService {

    private final ProductNormalizerProvider productNormalizerProvider;
    private final ReportInspectorProvider reportInspectorProvider;
    private final PriceInsightProvider priceInsightProvider;
    private final MarketBriefingProvider marketBriefingProvider;
    private final FieldSurveyPlannerProvider fieldSurveyPlannerProvider;

    public AgentService(
        ProductNormalizerProvider productNormalizerProvider,
        ReportInspectorProvider reportInspectorProvider,
        PriceInsightProvider priceInsightProvider,
        MarketBriefingProvider marketBriefingProvider,
        FieldSurveyPlannerProvider fieldSurveyPlannerProvider
    ) {
        this.productNormalizerProvider = productNormalizerProvider;
        this.reportInspectorProvider = reportInspectorProvider;
        this.priceInsightProvider = priceInsightProvider;
        this.marketBriefingProvider = marketBriefingProvider;
        this.fieldSurveyPlannerProvider = fieldSurveyPlannerProvider;
    }

    @Transactional(readOnly = true)
    public ProductNormalizeResponse normalize(ProductNormalizeRequest request) {
        return productNormalizerProvider.normalize(request);
    }

    @Transactional(readOnly = true)
    public ReportInspectResponse inspectReport(ReportInspectRequest request) {
        return reportInspectorProvider.inspect(request);
    }

    @Transactional(readOnly = true)
    public PriceInsightResponse explainPrice(PriceInsightRequest request) {
        return priceInsightProvider.explain(request);
    }

    @Transactional(readOnly = true)
    public MarketBriefingResponse briefMarket(MarketBriefingRequest request) {
        return marketBriefingProvider.brief(request);
    }

    @Transactional(readOnly = true)
    public FieldSurveyPlanResponse planFieldSurvey(FieldSurveyPlanRequest request) {
        return fieldSurveyPlannerProvider.plan(request);
    }
}

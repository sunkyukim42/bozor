package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.PriceInsightRequest;
import com.bozorcheck.domain.agent.dto.PriceInsightResponse;

public interface PriceInsightProvider {

    PriceInsightResponse explain(PriceInsightRequest request);
}

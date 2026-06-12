package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.MarketBriefingRequest;
import com.bozorcheck.domain.agent.dto.MarketBriefingResponse;

public interface MarketBriefingProvider {

    MarketBriefingResponse brief(MarketBriefingRequest request);
}

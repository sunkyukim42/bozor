package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.ProductNormalizeRequest;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;

public interface ProductNormalizerProvider {

    ProductNormalizeResponse normalize(ProductNormalizeRequest request);
}

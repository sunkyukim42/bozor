package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.ReportInspectRequest;
import com.bozorcheck.domain.agent.dto.ReportInspectResponse;

public interface ReportInspectorProvider {

    ReportInspectResponse inspect(ReportInspectRequest request);
}

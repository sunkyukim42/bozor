package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.FieldSurveyPlanRequest;
import com.bozorcheck.domain.agent.dto.FieldSurveyPlanResponse;

public interface FieldSurveyPlannerProvider {

    FieldSurveyPlanResponse plan(FieldSurveyPlanRequest request);
}

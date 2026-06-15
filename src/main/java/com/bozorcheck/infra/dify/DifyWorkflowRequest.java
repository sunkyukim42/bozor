package com.bozorcheck.infra.dify;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public record DifyWorkflowRequest(
    Map<String, Object> inputs,
    @JsonProperty("response_mode")
    String responseMode,
    String user
) {
    public static DifyWorkflowRequest blocking(Map<String, Object> inputs, String user) {
        return new DifyWorkflowRequest(inputs, "blocking", user);
    }
}

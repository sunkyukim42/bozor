package com.bozorcheck.infra.dify;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public record DifyWorkflowResponse(
    @JsonProperty("task_id")
    String taskId,
    @JsonProperty("workflow_run_id")
    String workflowRunId,
    DifyWorkflowData data
) {
    public record DifyWorkflowData(
        String status,
        Map<String, Object> outputs,
        String error
    ) {
    }
}

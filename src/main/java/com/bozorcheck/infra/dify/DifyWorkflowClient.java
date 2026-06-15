package com.bozorcheck.infra.dify;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class DifyWorkflowClient {

    private static final String DEFAULT_USER = "bozorcheck-backend";
    private static final String SUCCEEDED_STATUS = "succeeded";

    private final DifyProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public DifyWorkflowClient(
        DifyProperties properties,
        @Qualifier("difyRestClientBuilder") RestClient.Builder restClientBuilder,
        ObjectMapper objectMapper
    ) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> runWorkflow(
        DifyWorkflowType workflowType,
        Map<String, Object> inputs,
        String user
    ) {
        String apiKey = workflowType.apiKey(properties);
        if (!StringUtils.hasText(apiKey)) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.MISSING_API_KEY,
                "Dify workflow API key is missing for " + workflowType + "."
            );
        }

        DifyWorkflowRequest request = DifyWorkflowRequest.blocking(
            inputs == null ? Map.of() : inputs,
            StringUtils.hasText(user) ? user : DEFAULT_USER
        );

        DifyWorkflowResponse response = executeRequest(apiKey, request);
        return outputs(response);
    }

    private DifyWorkflowResponse executeRequest(String apiKey, DifyWorkflowRequest request) {
        try {
            return restClient.post()
                .uri("/workflows/run")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange((clientRequest, clientResponse) -> {
                    String body = StreamUtils.copyToString(clientResponse.getBody(), StandardCharsets.UTF_8);
                    if (!clientResponse.getStatusCode().is2xxSuccessful()) {
                        throw new DifyWorkflowException(
                            DifyWorkflowErrorCode.HTTP_ERROR,
                            "Dify workflow request failed with HTTP status " + clientResponse.getStatusCode().value() + "."
                        );
                    }
                    return parseResponse(body);
                });
        } catch (DifyWorkflowException exception) {
            throw exception;
        } catch (ResourceAccessException exception) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.TIMEOUT,
                "Dify workflow request timed out or could not be reached.",
                exception
            );
        } catch (RestClientException exception) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.HTTP_ERROR,
                "Dify workflow request failed.",
                exception
            );
        }
    }

    private DifyWorkflowResponse parseResponse(String body) {
        if (!StringUtils.hasText(body)) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.INVALID_RESPONSE,
                "Dify workflow response body was empty."
            );
        }
        try {
            return objectMapper.readValue(body, DifyWorkflowResponse.class);
        } catch (JsonProcessingException exception) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.INVALID_RESPONSE,
                "Dify workflow response was not valid JSON.",
                exception
            );
        }
    }

    private Map<String, Object> outputs(DifyWorkflowResponse response) {
        if (response == null || response.data() == null) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.INVALID_RESPONSE,
                "Dify workflow response data was missing."
            );
        }
        if (!SUCCEEDED_STATUS.equals(response.data().status())) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.WORKFLOW_FAILED,
                "Dify workflow did not succeed."
            );
        }
        if (response.data().outputs() == null) {
            throw new DifyWorkflowException(
                DifyWorkflowErrorCode.INVALID_RESPONSE,
                "Dify workflow outputs were missing."
            );
        }
        return response.data().outputs();
    }
}

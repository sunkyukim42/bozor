package com.bozorcheck.infra.dify;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.util.StreamUtils;

class DifyWorkflowClientTest {

    private static final String RAW_KEY = "unit-test-key-123456";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpServer server;
    private ExecutorService executor;
    private RecordedRequest recordedRequest;

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
        if (executor != null) {
            executor.shutdownNow();
        }
    }

    @Test
    void returnsOutputsFromSuccessfulBlockingResponse() throws Exception {
        respond(200, """
            {
              "task_id": "task-1",
              "workflow_run_id": "run-1",
              "data": {
                "status": "succeeded",
                "outputs": {
                  "standardProductCode": "TOMATO",
                  "confidence": 0.92
                },
                "error": null
              }
            }
            """);
        DifyWorkflowClient client = client(1000);

        Map<String, Object> outputs = client.runWorkflow(
            DifyWorkflowType.PRODUCT_NORMALIZER,
            Map.of("rawProductName", "pink greenhouse pomidor"),
            "qa-user"
        );

        assertThat(outputs).containsEntry("standardProductCode", "TOMATO");
        assertThat(outputs).containsEntry("confidence", 0.92);

        JsonNode requestJson = objectMapper.readTree(recordedRequest.body());
        assertThat(recordedRequest.method()).isEqualTo("POST");
        assertThat(recordedRequest.authorization()).isEqualTo("Bearer " + RAW_KEY);
        assertThat(recordedRequest.contentType()).contains("application/json");
        assertThat(requestJson.path("response_mode").asText()).isEqualTo("blocking");
        assertThat(requestJson.path("user").asText()).isEqualTo("qa-user");
        assertThat(requestJson.path("inputs").path("rawProductName").asText()).isEqualTo("pink greenhouse pomidor");
    }

    @Test
    void missingApiKeyThrowsControlledException() {
        DifyProperties properties = properties(1000);
        properties.setProductNormalizerApiKey("");
        DifyWorkflowClient client = new DifyWorkflowClient(
            properties,
            new DifyConfig().difyRestClientBuilder(properties),
            objectMapper
        );

        assertThatThrownBy(() -> client.runWorkflow(DifyWorkflowType.PRODUCT_NORMALIZER, Map.of(), "qa-user"))
            .isInstanceOf(DifyWorkflowException.class)
            .satisfies(exception -> assertThat(((DifyWorkflowException) exception).errorCode())
                .isEqualTo(DifyWorkflowErrorCode.MISSING_API_KEY))
            .hasMessageNotContaining(RAW_KEY);
    }

    @Test
    void non2xxResponseThrowsControlledException() throws Exception {
        respond(500, "{\"message\":\"server error\"}");
        DifyWorkflowClient client = client(1000);

        assertThatThrownBy(() -> client.runWorkflow(DifyWorkflowType.PRODUCT_NORMALIZER, Map.of(), "qa-user"))
            .isInstanceOf(DifyWorkflowException.class)
            .satisfies(exception -> assertThat(((DifyWorkflowException) exception).errorCode())
                .isEqualTo(DifyWorkflowErrorCode.HTTP_ERROR))
            .hasMessageNotContaining(RAW_KEY);
    }

    @Test
    void timeoutThrowsControlledException() throws Exception {
        startServer(exchange -> {
            try {
                Thread.sleep(700);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
            }
            writeResponse(exchange, 200, """
                {"data":{"status":"succeeded","outputs":{"ok":true}}}
                """);
        });
        DifyWorkflowClient client = client(100);

        assertThatThrownBy(() -> client.runWorkflow(DifyWorkflowType.PRODUCT_NORMALIZER, Map.of(), "qa-user"))
            .isInstanceOf(DifyWorkflowException.class)
            .satisfies(exception -> assertThat(((DifyWorkflowException) exception).errorCode())
                .isEqualTo(DifyWorkflowErrorCode.TIMEOUT))
            .hasMessageNotContaining(RAW_KEY);
    }

    @Test
    void failedWorkflowStatusThrowsControlledException() throws Exception {
        respond(200, """
            {"data":{"status":"failed","outputs":{},"error":"bad input"}}
            """);
        DifyWorkflowClient client = client(1000);

        assertThatThrownBy(() -> client.runWorkflow(DifyWorkflowType.PRODUCT_NORMALIZER, Map.of(), "qa-user"))
            .isInstanceOf(DifyWorkflowException.class)
            .satisfies(exception -> assertThat(((DifyWorkflowException) exception).errorCode())
                .isEqualTo(DifyWorkflowErrorCode.WORKFLOW_FAILED))
            .hasMessageNotContaining(RAW_KEY);
    }

    @Test
    void missingOutputsThrowsControlledException() throws Exception {
        respond(200, """
            {"data":{"status":"succeeded","error":null}}
            """);
        DifyWorkflowClient client = client(1000);

        assertThatThrownBy(() -> client.runWorkflow(DifyWorkflowType.PRODUCT_NORMALIZER, Map.of(), "qa-user"))
            .isInstanceOf(DifyWorkflowException.class)
            .satisfies(exception -> assertThat(((DifyWorkflowException) exception).errorCode())
                .isEqualTo(DifyWorkflowErrorCode.INVALID_RESPONSE))
            .hasMessageNotContaining(RAW_KEY);
    }

    @Test
    void invalidJsonThrowsControlledException() throws Exception {
        respond(200, "not-json");
        DifyWorkflowClient client = client(1000);

        assertThatThrownBy(() -> client.runWorkflow(DifyWorkflowType.PRODUCT_NORMALIZER, Map.of(), "qa-user"))
            .isInstanceOf(DifyWorkflowException.class)
            .satisfies(exception -> assertThat(((DifyWorkflowException) exception).errorCode())
                .isEqualTo(DifyWorkflowErrorCode.INVALID_RESPONSE))
            .hasMessageNotContaining(RAW_KEY);
    }

    private DifyWorkflowClient client(int timeoutMillis) {
        DifyProperties properties = properties(timeoutMillis);
        return new DifyWorkflowClient(
            properties,
            new DifyConfig().difyRestClientBuilder(properties),
            objectMapper
        );
    }

    private DifyProperties properties(int timeoutMillis) {
        DifyProperties properties = new DifyProperties();
        int port = server == null ? 1 : server.getAddress().getPort();
        properties.setBaseUrl("http://localhost:" + port);
        properties.setTimeoutMillis(timeoutMillis);
        properties.setProductNormalizerApiKey(RAW_KEY);
        properties.setReportInspectorApiKey("report-" + RAW_KEY);
        properties.setPriceInsightApiKey("insight-" + RAW_KEY);
        return properties;
    }

    private void respond(int statusCode, String responseBody) throws IOException {
        startServer(exchange -> writeResponse(exchange, statusCode, responseBody));
    }

    private void startServer(ExchangeHandler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        executor = Executors.newCachedThreadPool();
        server.setExecutor(executor);
        server.createContext("/workflows/run", exchange -> {
            recordedRequest = new RecordedRequest(
                exchange.getRequestMethod(),
                exchange.getRequestHeaders().getFirst("Authorization"),
                exchange.getRequestHeaders().getFirst("Content-Type"),
                StreamUtils.copyToString(exchange.getRequestBody(), StandardCharsets.UTF_8)
            );
            handler.handle(exchange);
        });
        server.start();
    }

    private void writeResponse(HttpExchange exchange, int statusCode, String responseBody) throws IOException {
        byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().put("Content-Type", List.of("application/json"));
        exchange.sendResponseHeaders(statusCode, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    private record RecordedRequest(
        String method,
        String authorization,
        String contentType,
        String body
    ) {
    }

    @FunctionalInterface
    private interface ExchangeHandler {
        void handle(HttpExchange exchange) throws IOException;
    }
}

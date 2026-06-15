package com.bozorcheck.infra.dify;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class DifyPropertiesTest {

    @Test
    void defaultsAreSafeForLocalMockMode() {
        DifyProperties properties = new DifyProperties();

        assertThat(properties.isEnabled()).isFalse();
        assertThat(properties.getBaseUrl()).isEqualTo("https://api.dify.ai/v1");
        assertThat(properties.getTimeoutMillis()).isEqualTo(8000);
        assertThat(properties.getProductNormalizerApiKey()).isEmpty();
        assertThat(properties.getReportInspectorApiKey()).isEmpty();
        assertThat(properties.getPriceInsightApiKey()).isEmpty();
    }

    @Test
    void bindsFromAgentDifyProperties() {
        MapConfigurationPropertySource source = new MapConfigurationPropertySource();
        source.put("agent.dify.enabled", "true");
        source.put("agent.dify.base-url", "http://localhost:18080/v1");
        source.put("agent.dify.timeout-millis", "2500");
        source.put("agent.dify.product-normalizer-api-key", "product-key-value");
        source.put("agent.dify.report-inspector-api-key", "report-key-value");
        source.put("agent.dify.price-insight-api-key", "insight-key-value");

        DifyProperties properties = new Binder(source)
            .bind("agent.dify", Bindable.of(DifyProperties.class))
            .orElseThrow(() -> new AssertionError("agent.dify properties did not bind"));

        assertThat(properties.isEnabled()).isTrue();
        assertThat(properties.getBaseUrl()).isEqualTo("http://localhost:18080/v1");
        assertThat(properties.getTimeoutMillis()).isEqualTo(2500);
        assertThat(properties.getProductNormalizerApiKey()).isEqualTo("product-key-value");
        assertThat(properties.getReportInspectorApiKey()).isEqualTo("report-key-value");
        assertThat(properties.getPriceInsightApiKey()).isEqualTo("insight-key-value");
    }

    @Test
    void emptyKeysDoNotBreakApplicationContext() {
        new ApplicationContextRunner()
            .withUserConfiguration(DifyConfig.class)
            .run(context -> {
                assertThat(context).hasNotFailed();
                assertThat(context).hasSingleBean(DifyProperties.class);
            });
    }

    @Test
    void keyMaskingDoesNotExposeRawKey() {
        DifyProperties properties = new DifyProperties();
        properties.setProductNormalizerApiKey("unit-test-key-123456");

        assertThat(properties.maskedApiKey(DifyWorkflowType.PRODUCT_NORMALIZER)).isEqualTo("****3456");
        assertThat(properties.toString()).doesNotContain("unit-test-key-123456");
    }
}

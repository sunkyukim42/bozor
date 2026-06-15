package com.bozorcheck.infra.dify;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "agent.dify")
public class DifyProperties {

    private boolean enabled = false;
    private String baseUrl = "https://api.dify.ai/v1";
    private int timeoutMillis = 8000;
    private String productNormalizerApiKey = "";
    private String reportInspectorApiKey = "";
    private String priceInsightApiKey = "";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeoutMillis() {
        return timeoutMillis;
    }

    public void setTimeoutMillis(int timeoutMillis) {
        this.timeoutMillis = timeoutMillis;
    }

    public String getProductNormalizerApiKey() {
        return productNormalizerApiKey;
    }

    public void setProductNormalizerApiKey(String productNormalizerApiKey) {
        this.productNormalizerApiKey = productNormalizerApiKey;
    }

    public String getReportInspectorApiKey() {
        return reportInspectorApiKey;
    }

    public void setReportInspectorApiKey(String reportInspectorApiKey) {
        this.reportInspectorApiKey = reportInspectorApiKey;
    }

    public String getPriceInsightApiKey() {
        return priceInsightApiKey;
    }

    public void setPriceInsightApiKey(String priceInsightApiKey) {
        this.priceInsightApiKey = priceInsightApiKey;
    }

    public String maskedApiKey(DifyWorkflowType workflowType) {
        return maskApiKey(workflowType.apiKey(this));
    }

    public static String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            return "";
        }
        int visibleSuffixLength = Math.min(4, apiKey.length());
        return "****" + apiKey.substring(apiKey.length() - visibleSuffixLength);
    }

    @Override
    public String toString() {
        return "DifyProperties{" +
            "enabled=" + enabled +
            ", baseUrl='" + baseUrl + '\'' +
            ", timeoutMillis=" + timeoutMillis +
            ", productNormalizerApiKey='" + maskApiKey(productNormalizerApiKey) + '\'' +
            ", reportInspectorApiKey='" + maskApiKey(reportInspectorApiKey) + '\'' +
            ", priceInsightApiKey='" + maskApiKey(priceInsightApiKey) + '\'' +
            '}';
    }
}

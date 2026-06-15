package com.bozorcheck.infra.dify;

public enum DifyWorkflowType {
    PRODUCT_NORMALIZER {
        @Override
        String apiKey(DifyProperties properties) {
            return properties.getProductNormalizerApiKey();
        }
    },
    REPORT_INSPECTOR {
        @Override
        String apiKey(DifyProperties properties) {
            return properties.getReportInspectorApiKey();
        }
    },
    PRICE_INSIGHT {
        @Override
        String apiKey(DifyProperties properties) {
            return properties.getPriceInsightApiKey();
        }
    };

    abstract String apiKey(DifyProperties properties);
}

package com.bozorcheck.common.api;

import java.util.Map;

public record ErrorResponse(
    boolean success,
    ErrorBody error
) {

    public static ErrorResponse of(String code, String message) {
        return of(code, message, Map.of());
    }

    public static ErrorResponse of(String code, String message, Map<String, Object> details) {
        return new ErrorResponse(false, new ErrorBody(code, message, details));
    }

    public record ErrorBody(
        String code,
        String message,
        Map<String, Object> details
    ) {
    }
}

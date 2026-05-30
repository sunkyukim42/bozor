package com.bozorcheck.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Product not found."),
    MARKET_NOT_FOUND(HttpStatus.NOT_FOUND, "Market not found."),
    DATA_SOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Data source not found."),
    PRICE_SUMMARY_NOT_FOUND(HttpStatus.NOT_FOUND, "Price summary not found."),
    PRICE_REPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "Price report not found."),
    PRICE_OBSERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Price observation not found."),
    INVALID_PRICE(HttpStatus.BAD_REQUEST, "Invalid price."),
    INVALID_STATUS_TRANSITION(HttpStatus.BAD_REQUEST, "Invalid status transition."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation failed."),
    DATA_INTEGRITY_ERROR(HttpStatus.CONFLICT, "Data integrity violation."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() {
        return status;
    }

    public String message() {
        return message;
    }
}

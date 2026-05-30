package com.bozorcheck.common.exception;

import com.bozorcheck.common.api.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException exception) {
        ErrorCode code = exception.errorCode();
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), exception.getMessage(), exception.details()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
        Map<String, Object> details = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
            details.put(error.getField(), error.getDefaultMessage())
        );
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), code.message(), details));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException exception) {
        Map<String, Object> details = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
            details.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), code.message(), details));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException exception) {
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), exception.getMessage()));
    }

    @ExceptionHandler({
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class,
        HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception exception) {
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), code.message(), Map.of("reason", exception.getMessage())));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException exception) {
        Throwable rootCause = exception.getMostSpecificCause();
        String causeMessage = rootCause == null ? exception.getMessage() : rootCause.getMessage();
        log.warn("Data integrity violation: {}", causeMessage);
        ErrorCode code = ErrorCode.DATA_INTEGRITY_ERROR;
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), code.message()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception exception) {
        log.error("Unexpected API error", exception);
        ErrorCode code = ErrorCode.INTERNAL_SERVER_ERROR;
        return ResponseEntity
            .status(code.status())
            .body(ErrorResponse.of(code.name(), code.message()));
    }
}

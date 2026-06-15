package com.bozorcheck.infra.dify;

public class DifyWorkflowException extends RuntimeException {

    private final DifyWorkflowErrorCode errorCode;

    public DifyWorkflowException(DifyWorkflowErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public DifyWorkflowException(DifyWorkflowErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public DifyWorkflowErrorCode errorCode() {
        return errorCode;
    }
}

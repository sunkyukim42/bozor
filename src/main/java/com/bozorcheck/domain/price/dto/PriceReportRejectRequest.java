package com.bozorcheck.domain.price.dto;

import jakarta.validation.constraints.NotBlank;

public record PriceReportRejectRequest(
    @NotBlank String reviewNote
) {
}

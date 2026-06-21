package com.cinemist.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/** 建立訂單的請求（不含價格，由伺服器計算）。 */
public record CreateBookingRequest(
        @NotNull Long showtimeId,
        @NotEmpty List<Long> seatIds,
        @Email @NotBlank String email) {}

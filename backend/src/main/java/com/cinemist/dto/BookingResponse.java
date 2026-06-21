package com.cinemist.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** 訂單回應（建立與查詢共用）。 */
public record BookingResponse(
        String bookingNumber,
        Long showtimeId,
        MovieInfo movie,
        ShowtimeInfo showtime,
        String email,
        BigDecimal totalAmount,
        List<SeatInfo> seats,
        LocalDateTime createdAt) {

    public record MovieInfo(String title, String posterUrl) {}
    public record ShowtimeInfo(LocalDateTime startTime, TheaterInfo theater) {}
    public record TheaterInfo(String name, String location) {}
    public record SeatInfo(String rowLabel, int seatNumber) {}
}

package com.cinemist.dto;

/** 座位狀態（衍生值：booking_seat 列存在即 SOLD）。 */
public record SeatStatusDto(Long seatId, String rowLabel, int seatNumber, String status) {}

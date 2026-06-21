package com.cinemist.model;

/** 座位資料（immutable record）。 */
public record Seat(Long id, Long theaterId, String rowLabel, int seatNumber) {}

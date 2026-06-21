package com.cinemist.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 場次回應（含影廳名稱，供日期選擇頁顯示）。 */
public record ShowtimeDto(
        Long id,
        Long movieId,
        LocalDateTime startTime,
        BigDecimal price,
        TheaterInfo theater) {

    public record TheaterInfo(Long id, String name, String location) {}
}

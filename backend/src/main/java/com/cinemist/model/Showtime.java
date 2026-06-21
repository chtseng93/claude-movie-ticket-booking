package com.cinemist.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 場次資料（immutable record）。 */
public record Showtime(Long id, Long movieId, Long theaterId, LocalDateTime startTime, BigDecimal price) {}

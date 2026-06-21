package com.cinemist.model;

import java.math.BigDecimal;

/** 電影資料（immutable record）。 */
public record Movie(Long id, String title, String description, String posterUrl,
                    String genre, int durationMinutes, BigDecimal rating) {}

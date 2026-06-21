package com.cinemist.model;

/** 影廳資料（immutable record）。 */
public record Theater(Long id, String name, String location, int totalSeats) {}

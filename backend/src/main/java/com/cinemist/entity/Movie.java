package com.cinemist.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/** 電影。 */
@Entity
@Table(name = "movie")
public class Movie {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(length = 2000)
    private String description;
    @Column(name = "poster_url", length = 1000)
    private String posterUrl;
    private String genre;
    @Column(name = "duration_minutes")
    private int durationMinutes;
    private BigDecimal rating;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getPosterUrl() { return posterUrl; }
    public String getGenre() { return genre; }
    public int getDurationMinutes() { return durationMinutes; }
    public BigDecimal getRating() { return rating; }
}

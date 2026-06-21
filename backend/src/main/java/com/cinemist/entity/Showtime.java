package com.cinemist.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 場次。 */
@Entity
@Table(name = "showtime")
public class Showtime {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "movie_id")
    private Long movieId;
    @Column(name = "theater_id")
    private Long theaterId;
    @Column(name = "start_time")
    private LocalDateTime startTime;
    private BigDecimal price;

    public Long getId() { return id; }
    public Long getMovieId() { return movieId; }
    public Long getTheaterId() { return theaterId; }
    public LocalDateTime getStartTime() { return startTime; }
    public BigDecimal getPrice() { return price; }
}

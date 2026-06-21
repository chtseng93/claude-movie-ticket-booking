package com.cinemist.entity;

import jakarta.persistence.*;

/** 座位（屬於某影廳）。 */
@Entity
@Table(name = "seat")
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "theater_id")
    private Long theaterId;
    @Column(name = "row_label")
    private String rowLabel;
    @Column(name = "seat_number")
    private int seatNumber;

    public Long getId() { return id; }
    public Long getTheaterId() { return theaterId; }
    public String getRowLabel() { return rowLabel; }
    public int getSeatNumber() { return seatNumber; }
}

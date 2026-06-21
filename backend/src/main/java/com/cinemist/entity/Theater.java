package com.cinemist.entity;

import jakarta.persistence.*;

/** 影廳 / 影城。 */
@Entity
@Table(name = "theater")
public class Theater {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;
    @Column(name = "total_seats")
    private int totalSeats;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public int getTotalSeats() { return totalSeats; }
}

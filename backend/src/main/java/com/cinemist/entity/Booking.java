package com.cinemist.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 訂單。 */
@Entity
@Table(name = "booking")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "booking_number", unique = true)
    private String bookingNumber;
    @Column(name = "showtime_id")
    private Long showtimeId;
    private String email;
    @Column(name = "total_amount")
    private BigDecimal totalAmount;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Booking() {}
    public Booking(String bookingNumber, Long showtimeId, String email, BigDecimal totalAmount) {
        this.bookingNumber = bookingNumber;
        this.showtimeId = showtimeId;
        this.email = email;
        this.totalAmount = totalAmount;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getBookingNumber() { return bookingNumber; }
    public Long getShowtimeId() { return showtimeId; }
    public String getEmail() { return email; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

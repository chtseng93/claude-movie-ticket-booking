package com.cinemist.entity;

import jakarta.persistence.*;

/**
 * 訂單座位明細。
 * UNIQUE(showtime_id, seat_id) 由資料庫防止同場次同座位被重複購買。
 * 列存在即代表座位已售出，無需 status 欄位。
 */
@Entity
@Table(name = "booking_seat",
       uniqueConstraints = @UniqueConstraint(columnNames = {"showtime_id", "seat_id"}))
public class BookingSeat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "booking_id")
    private Long bookingId;
    @Column(name = "showtime_id")
    private Long showtimeId;
    @Column(name = "seat_id")
    private Long seatId;

    public BookingSeat() {}
    public BookingSeat(Long bookingId, Long showtimeId, Long seatId) {
        this.bookingId = bookingId;
        this.showtimeId = showtimeId;
        this.seatId = seatId;
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Long getShowtimeId() { return showtimeId; }
    public Long getSeatId() { return seatId; }
}

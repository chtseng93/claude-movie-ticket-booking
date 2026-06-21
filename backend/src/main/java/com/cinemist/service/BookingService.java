package com.cinemist.service;

import com.cinemist.dto.BookingResponse;
import com.cinemist.dto.CreateBookingRequest;
import com.cinemist.entity.*;
import com.cinemist.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;

/** 訂單服務：建立訂單與查詢。雙重購買由 DB UNIQUE(showtime_id, seat_id) 約束擋下。 */
@Service
public class BookingService {
    private final BookingRepository bookings;
    private final BookingSeatRepository bookingSeats;
    private final SeatRepository seats;
    private final ShowtimeRepository showtimes;
    private final MovieRepository movies;
    private final TheaterRepository theaters;
    private static final SecureRandom RNG = new SecureRandom();
    private static final String HEX = "0123456789ABCDEF";

    public BookingService(BookingRepository bookings, BookingSeatRepository bookingSeats,
                          SeatRepository seats, ShowtimeRepository showtimes,
                          MovieRepository movies, TheaterRepository theaters) {
        this.bookings = bookings;
        this.bookingSeats = bookingSeats;
        this.seats = seats;
        this.showtimes = showtimes;
        this.movies = movies;
        this.theaters = theaters;
    }

    /** 建立訂單。座位重複時拋出 SeatConflictException。 */
    @Transactional
    public BookingResponse create(CreateBookingRequest req) {
        Showtime st = showtimes.findById(req.showtimeId())
                .orElseThrow(() -> new NoSuchElementException("Showtime not found"));
        BigDecimal total = st.getPrice().multiply(BigDecimal.valueOf(req.seatIds().size()));
        Booking booking = bookings.save(
                new Booking(generateBookingNumber(), st.getId(), req.email(), total));
        try {
            for (Long seatId : req.seatIds()) {
                bookingSeats.save(new BookingSeat(booking.getId(), st.getId(), seatId));
            }
            // 強制 flush 觸發 UNIQUE 檢查，仍在交易內
            bookingSeats.flush();
        } catch (DataIntegrityViolationException e) {
            throw new SeatConflictException("Seat already taken");
        }
        return toResponse(booking);
    }

    /** 依訂單編號查詢。 */
    @Transactional(readOnly = true)
    public BookingResponse findByNumber(String bookingNumber) {
        Booking booking = bookings.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
        return toResponse(booking);
    }

    /** 組裝訂單回應，含電影、影廳、座位明細。 */
    private BookingResponse toResponse(Booking booking) {
        Showtime st = showtimes.findById(booking.getShowtimeId()).orElseThrow();
        Movie movie = movies.findById(st.getMovieId()).orElseThrow();
        Theater theater = theaters.findById(st.getTheaterId()).orElseThrow();
        List<BookingResponse.SeatInfo> seatInfos = bookingSeats.findByBookingId(booking.getId())
                .stream()
                .map(bs -> seats.findById(bs.getSeatId()).orElseThrow())
                .map(s -> new BookingResponse.SeatInfo(s.getRowLabel(), s.getSeatNumber()))
                .toList();
        return new BookingResponse(
                booking.getBookingNumber(), st.getId(),
                new BookingResponse.MovieInfo(movie.getTitle(), movie.getPosterUrl()),
                new BookingResponse.ShowtimeInfo(st.getStartTime(),
                        new BookingResponse.TheaterInfo(theater.getName(), theater.getLocation())),
                booking.getEmail(), booking.getTotalAmount(), seatInfos, booking.getCreatedAt());
    }

    /** 產生訂單編號 CNM-YYYYMMDD-XXXX（XXXX 為 4 位大寫十六進位）。 */
    private String generateBookingNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        StringBuilder sb = new StringBuilder("CNM-").append(date).append('-');
        for (int i = 0; i < 4; i++) sb.append(HEX.charAt(RNG.nextInt(16)));
        return sb.toString();
    }
}

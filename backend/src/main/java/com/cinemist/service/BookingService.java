package com.cinemist.service;

import com.cinemist.dto.BookingResponse;
import com.cinemist.dto.CreateBookingRequest;
import com.cinemist.model.Movie;
import com.cinemist.model.Seat;
import com.cinemist.model.Showtime;
import com.cinemist.model.Theater;
import com.cinemist.store.DataStore;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;

/** 訂單服務：建立訂單與查詢。雙重購買由 DataStore synchronized 區塊擋下。 */
@Service
public class BookingService {
    private final DataStore store;
    private final ShowtimeService showtimeService;
    private static final SecureRandom RNG = new SecureRandom();
    private static final String HEX = "0123456789ABCDEF";

    public BookingService(DataStore store, ShowtimeService showtimeService) {
        this.store = store;
        this.showtimeService = showtimeService;
    }

    /** 建立訂單。座位重複時拋出 SeatConflictException。 */
    public BookingResponse create(CreateBookingRequest req) {
        Showtime st = showtimeService.findById(req.showtimeId());
        BigDecimal total = st.price().multiply(BigDecimal.valueOf(req.seatIds().size()));
        DataStore.BookingRecord br = store.createBooking(
                generateBookingNumber(), st.id(), req.email(), total, req.seatIds());
        return toResponse(br);
    }

    /** 依訂單編號查詢。 */
    public BookingResponse findByNumber(String bookingNumber) {
        DataStore.BookingRecord br = store.findBookingByNumber(bookingNumber)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
        return toResponse(br);
    }

    /** 組裝訂單回應，含電影、影廳、座位明細。 */
    private BookingResponse toResponse(DataStore.BookingRecord br) {
        Showtime st = showtimeService.findById(br.showtimeId());
        Movie movie = store.movies.stream().filter(m -> m.id().equals(st.movieId())).findFirst().orElseThrow();
        Theater theater = store.theaters.stream().filter(t -> t.id().equals(st.theaterId())).findFirst().orElseThrow();
        List<BookingResponse.SeatInfo> seatInfos = br.seatIds().stream()
                .map(seatId -> store.seats.stream().filter(s -> s.id().equals(seatId)).findFirst().orElseThrow())
                .map(s -> new BookingResponse.SeatInfo(s.rowLabel(), s.seatNumber()))
                .toList();
        return new BookingResponse(
                br.bookingNumber(), br.showtimeId(),
                new BookingResponse.MovieInfo(movie.title(), movie.posterUrl()),
                new BookingResponse.ShowtimeInfo(st.startTime(),
                        new BookingResponse.TheaterInfo(theater.name(), theater.location())),
                br.email(), br.totalAmount(), seatInfos, br.createdAt());
    }

    /** 產生訂單編號 CNM-YYYYMMDD-XXXX（XXXX 為 4 位大寫十六進位）。 */
    private String generateBookingNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        StringBuilder sb = new StringBuilder("CNM-").append(date).append('-');
        for (int i = 0; i < 4; i++) sb.append(HEX.charAt(RNG.nextInt(16)));
        return sb.toString();
    }
}

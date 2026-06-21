package com.cinemist.service;

import com.cinemist.dto.SeatStatusDto;
import com.cinemist.entity.Seat;
import com.cinemist.entity.Showtime;
import com.cinemist.repository.BookingSeatRepository;
import com.cinemist.repository.SeatRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** 座位狀態服務：booking_seat 列存在即 SOLD，否則 AVAILABLE。 */
@Service
public class SeatService {
    private final SeatRepository seats;
    private final BookingSeatRepository bookingSeats;
    private final ShowtimeService showtimeService;

    public SeatService(SeatRepository seats, BookingSeatRepository bookingSeats,
                       ShowtimeService showtimeService) {
        this.seats = seats;
        this.bookingSeats = bookingSeats;
        this.showtimeService = showtimeService;
    }

    /** 取得某場次所有座位及其即時狀態。 */
    public List<SeatStatusDto> seatsForShowtime(Long showtimeId) {
        Showtime st = showtimeService.findById(showtimeId);
        Set<Long> soldSeatIds = bookingSeats.findByShowtimeId(showtimeId).stream()
                .map(bs -> bs.getSeatId())
                .collect(Collectors.toSet());
        return seats.findByTheaterIdOrderByRowLabelAscSeatNumberAsc(st.getTheaterId()).stream()
                .map(s -> new SeatStatusDto(s.getId(), s.getRowLabel(), s.getSeatNumber(),
                        soldSeatIds.contains(s.getId()) ? "SOLD" : "AVAILABLE"))
                .toList();
    }
}

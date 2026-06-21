package com.cinemist.service;

import com.cinemist.dto.SeatStatusDto;
import com.cinemist.model.Seat;
import com.cinemist.model.Showtime;
import com.cinemist.store.DataStore;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/** 座位狀態服務：soldSeats 中存在即 SOLD，否則 AVAILABLE。 */
@Service
public class SeatService {
    private final DataStore store;
    private final ShowtimeService showtimeService;

    public SeatService(DataStore store, ShowtimeService showtimeService) {
        this.store = store;
        this.showtimeService = showtimeService;
    }

    /** 取得某場次所有座位及其即時狀態。 */
    public List<SeatStatusDto> seatsForShowtime(Long showtimeId) {
        Showtime st = showtimeService.findById(showtimeId);
        Set<Long> sold = store.getSoldSeatIds(showtimeId);
        return store.seats.stream()
                .filter(s -> s.theaterId().equals(st.theaterId()))
                .sorted(Comparator.comparing(Seat::rowLabel).thenComparingInt(Seat::seatNumber))
                .map(s -> new SeatStatusDto(s.id(), s.rowLabel(), s.seatNumber(),
                        sold.contains(s.id()) ? "SOLD" : "AVAILABLE"))
                .toList();
    }
}

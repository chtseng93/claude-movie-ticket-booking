package com.cinemist.web;

import com.cinemist.dto.SeatStatusDto;
import com.cinemist.service.SeatService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SeatController {
    private final SeatService seats;
    public SeatController(SeatService seats) { this.seats = seats; }

    @GetMapping("/showtimes/{showtimeId}/seats")
    public List<SeatStatusDto> forShowtime(@PathVariable Long showtimeId) {
        return seats.seatsForShowtime(showtimeId);
    }
}

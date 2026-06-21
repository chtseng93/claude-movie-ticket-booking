package com.cinemist.web;

import com.cinemist.dto.ShowtimeDto;
import com.cinemist.service.ShowtimeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ShowtimeController {
    private final ShowtimeService showtimes;
    public ShowtimeController(ShowtimeService showtimes) { this.showtimes = showtimes; }

    @GetMapping("/movies/{movieId}/showtimes")
    public List<ShowtimeDto> forMovie(@PathVariable Long movieId) {
        return showtimes.findByMovie(movieId);
    }
}

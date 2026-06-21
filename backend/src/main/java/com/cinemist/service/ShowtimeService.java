package com.cinemist.service;

import com.cinemist.dto.ShowtimeDto;
import com.cinemist.entity.Showtime;
import com.cinemist.entity.Theater;
import com.cinemist.repository.ShowtimeRepository;
import com.cinemist.repository.TheaterRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

/** 場次查詢服務。 */
@Service
public class ShowtimeService {
    private final ShowtimeRepository showtimes;
    private final TheaterRepository theaters;

    public ShowtimeService(ShowtimeRepository showtimes, TheaterRepository theaters) {
        this.showtimes = showtimes;
        this.theaters = theaters;
    }

    /** 取得某電影的場次列表，含影廳資訊。 */
    public List<ShowtimeDto> findByMovie(Long movieId) {
        return showtimes.findByMovieIdOrderByStartTime(movieId).stream()
                .map(this::toDto)
                .toList();
    }

    public Showtime findById(Long id) {
        return showtimes.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Showtime not found"));
    }

    /** 將場次 entity 轉為含影廳的 DTO。 */
    private ShowtimeDto toDto(Showtime s) {
        Theater t = theaters.findById(s.getTheaterId()).orElseThrow();
        return new ShowtimeDto(s.getId(), s.getMovieId(), s.getStartTime(), s.getPrice(),
                new ShowtimeDto.TheaterInfo(t.getId(), t.getName(), t.getLocation()));
    }
}

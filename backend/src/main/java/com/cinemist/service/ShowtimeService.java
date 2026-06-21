package com.cinemist.service;

import com.cinemist.dto.ShowtimeDto;
import com.cinemist.model.Showtime;
import com.cinemist.model.Theater;
import com.cinemist.store.DataStore;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

/** 場次查詢服務。 */
@Service
public class ShowtimeService {
    private final DataStore store;
    public ShowtimeService(DataStore store) { this.store = store; }

    /** 取得某電影的場次列表，依開始時間排序，含影廳資訊。 */
    public List<ShowtimeDto> findByMovie(Long movieId) {
        return store.showtimes.stream()
                .filter(s -> s.movieId().equals(movieId))
                .sorted(Comparator.comparing(Showtime::startTime))
                .map(this::toDto)
                .toList();
    }

    public Showtime findById(Long id) {
        return store.showtimes.stream().filter(s -> s.id().equals(id)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("Showtime not found"));
    }

    private ShowtimeDto toDto(Showtime s) {
        Theater t = store.theaters.stream().filter(th -> th.id().equals(s.theaterId())).findFirst().orElseThrow();
        return new ShowtimeDto(s.id(), s.movieId(), s.startTime(), s.price(),
                new ShowtimeDto.TheaterInfo(t.id(), t.name(), t.location()));
    }
}

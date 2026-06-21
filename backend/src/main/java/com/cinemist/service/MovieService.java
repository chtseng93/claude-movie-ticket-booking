package com.cinemist.service;

import com.cinemist.model.Movie;
import com.cinemist.store.DataStore;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

/** 電影查詢服務。 */
@Service
public class MovieService {
    private final DataStore store;
    public MovieService(DataStore store) { this.store = store; }

    public List<Movie> findAll() { return store.movies; }

    public Movie findById(Long id) {
        return store.movies.stream().filter(m -> m.id().equals(id)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("Movie not found"));
    }
}

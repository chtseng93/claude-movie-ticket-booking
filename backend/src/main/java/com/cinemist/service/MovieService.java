package com.cinemist.service;

import com.cinemist.entity.Movie;
import com.cinemist.repository.MovieRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

/** 電影查詢服務。 */
@Service
public class MovieService {
    private final MovieRepository movies;
    public MovieService(MovieRepository movies) { this.movies = movies; }

    public List<Movie> findAll() { return movies.findAll(); }

    public Movie findById(Long id) {
        return movies.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Movie not found"));
    }
}

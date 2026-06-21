package com.cinemist.web;

import com.cinemist.entity.Movie;
import com.cinemist.service.MovieService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {
    private final MovieService movies;
    public MovieController(MovieService movies) { this.movies = movies; }

    @GetMapping
    public List<Movie> all() { return movies.findAll(); }

    @GetMapping("/{id}")
    public Movie one(@PathVariable Long id) { return movies.findById(id); }
}

package com.cinemist.repository;

import com.cinemist.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    /** 取得某電影的所有場次，依開始時間排序。 */
    List<Showtime> findByMovieIdOrderByStartTime(Long movieId);
}

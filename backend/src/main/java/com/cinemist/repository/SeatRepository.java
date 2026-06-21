package com.cinemist.repository;

import com.cinemist.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    /** 取得某影廳所有座位，依列、座號排序。 */
    List<Seat> findByTheaterIdOrderByRowLabelAscSeatNumberAsc(Long theaterId);
}

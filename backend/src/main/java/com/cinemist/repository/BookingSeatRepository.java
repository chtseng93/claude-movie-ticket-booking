package com.cinemist.repository;

import com.cinemist.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    /** 某場次已售出的座位明細（用於座位狀態圖）。 */
    List<BookingSeat> findByShowtimeId(Long showtimeId);
    /** 某訂單的座位明細。 */
    List<BookingSeat> findByBookingId(Long bookingId);
}

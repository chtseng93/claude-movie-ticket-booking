package com.cinemist.store;

import com.cinemist.model.*;
import com.cinemist.service.SeatConflictException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 全域記憶體資料儲存。
 * 靜態資料（電影、影廳、座位、場次）在啟動時初始化。
 * 訂單與座位售出狀態在 JVM 生命週期內維持，重啟後重置。
 */
@Component
public class DataStore {

    public final List<Movie> movies;
    public final List<Theater> theaters;
    public final List<Seat> seats;
    public final List<Showtime> showtimes;

    /** 訂單儲存：bookingNumber → BookingRecord。 */
    private final Map<String, BookingRecord> bookingsByNumber = new ConcurrentHashMap<>();

    /** 已售座位：showtimeId → Set<seatId>，寫入時透過 synchronized 保護。 */
    private final Map<Long, Set<Long>> soldSeats = new ConcurrentHashMap<>();

    private final AtomicLong bookingIdSeq = new AtomicLong(1);

    public record BookingRecord(Long id, String bookingNumber, Long showtimeId,
                                String email, BigDecimal totalAmount,
                                List<Long> seatIds, LocalDateTime createdAt) {}

    public DataStore() {
        movies = buildMovies();
        theaters = buildTheaters();
        seats = buildSeats(theaters);
        showtimes = buildShowtimes();
    }

    // ── 查詢 ──────────────────────────────────────────────────────────────────

    /** 取得某場次已售座位 ID（返回快照，執行緒安全）。 */
    public Set<Long> getSoldSeatIds(Long showtimeId) {
        Set<Long> sold = soldSeats.get(showtimeId);
        return sold == null ? Set.of() : Set.copyOf(sold);
    }

    public Optional<BookingRecord> findBookingByNumber(String number) {
        return Optional.ofNullable(bookingsByNumber.get(number));
    }

    // ── 寫入 ─────────────────────────────────────────────────────────────────

    /**
     * 建立訂單並標記座位為已售。
     * 使用 synchronized 確保同場次座位不被重複售出。
     */
    public synchronized BookingRecord createBooking(String bookingNumber, Long showtimeId,
                                                    String email, BigDecimal total, List<Long> seatIds) {
        Set<Long> sold = soldSeats.computeIfAbsent(showtimeId, k -> new HashSet<>());
        List<Long> added = new ArrayList<>();
        for (Long seatId : seatIds) {
            if (!sold.add(seatId)) {
                sold.removeAll(added); // rollback
                throw new SeatConflictException("Seat already taken");
            }
            added.add(seatId);
        }
        BookingRecord br = new BookingRecord(bookingIdSeq.getAndIncrement(), bookingNumber,
                showtimeId, email, total, List.copyOf(seatIds), LocalDateTime.now());
        bookingsByNumber.put(bookingNumber, br);
        return br;
    }

    // ── Seed data ─────────────────────────────────────────────────────────────

    private static List<Movie> buildMovies() {
        return List.of(
            new Movie(1L, "NEON RISING",
                "In a world where digital consciousness has become the ultimate currency, one operative must dive into the core of a decaying metropolis to retrieve a lost memory that could rewrite humanity's future.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBv23QzNciA2C68LlgJE4KtKUfxFB1NZt9ggmuFYpiYBLLJVuQl21duTHJKG8FNvWt56FDXCek-IGXS9JoB6-BOY10rY_y-bdPbFcrmJk_Ayayrmwp8BevMMVXOk38QwghxoIne8QOCvoFmOR3U9y1LbCu090zaBtenFQhihYVxggiI5R1AIaVHlRNeKvXHwWyt_1k-qEx7iyzcbbzwt9s1PSzODCiPRLnJPlSN3yxKOSor7M9cCilHNY5WfFXr-dnO42pb33Piymkp",
                "Sci-Fi / Action", 165, new BigDecimal("9.2")),
            new Movie(2L, "THE GATEWAY",
                "A portal to an unknown dimension opens, and the team that built it must decide whether to step through.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDXSvPq2gFXjzwYNtL4wfMZJC3dk7WbwDpXsDVRk145NCMWsXlRoW4-SVEhujnterHngd5s181TE8GIQSPtVVdRKq6TagTBTvhDYBqXx9bMMfYg84dn0gHYm6gGKE6OYnOM1z8BjA0CYZbhJNEKD_eWRLQ2F1IseZpveYyILqlt_Seht2BmdQ0yBlxUa3rkpKFDpuHq7WC06GIHg4BU8kv7c-q-RdQHkvkyhHe0NQDRpRTigLfx9vkZ0nMqGPw5bRYwm25DBPUwJX1x",
                "Sci-Fi / Thriller", 142, new BigDecimal("8.7")),
            new Movie(3L, "VOID RUNNERS",
                "Smugglers race across the dead zones of deep space, one jump ahead of the law and the dark.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBKumN51JDLgQXHh3pTbdcWN0upM0mccVfHeQjVEIfFX1bokg_SrgqMpzze0ixFSrCMnnjn2jfZIy9fIvqlD4QPwc_0KDE8OSPtJeZwiMFG3ae89rQir41Kq9mQI9p7nyjJlYGCTEnWJB7gxlARFnQ_40txPelD8eTHIzBpeKa_hp49kGHsB5qzEYcp3yT0hKrxbu7Y0itg6TJmBPi6r95UcykzfQheQSTp-joEFjqRr9mr7KiTrfKYstGq6yg0lAoNI4F737d4XVPD",
                "Action / Space", 128, new BigDecimal("8.2")),
            new Movie(4L, "SYNAPTIC",
                "A neuroscientist uncovers a memory that was never hers, and the people who will kill to keep it buried.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCG542Y9ctBruPN-eotH3FsZCIT5lRvyj4H22FWTzRYOvB5pYvDjjq2vC4qWmT9wAq-DeznOWOOMkLLeJ_V91hmjHgfu_2CJ9LYKdkNvXMaAQVzKsn59Nsz7kPXXOyBAXfGd0ErLjpiFUPfYjIPI7qfw8X4G9MDAJxKD3fWrdRkWuXijuVjiXamYB8giJgUmXA4h5NXntT_qoYFUJmPdqbbt1BjnCoN7Mg1GkOCREfPjieUdgy8JMEK1-xk7v_ywcGg2pt2wbOinv22",
                "Thriller / Drama", 137, new BigDecimal("9.0")),
            new Movie(5L, "KINETIC EDGE",
                "On the neon streets of a divided city, a courier becomes the only thing standing between order and collapse.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDmvvOtfQmm8Atc5rStHLnByywbiax9Luq93YnEK6n7NsXQf8dNf5akEsv6RrLns10aBWuGqERYbLs0dbzo77wzl-1F_htWMEvfyjBBDspJx97Of5H5wy2_fnkNj-HPiKDCo5eUd00NMZuRzgelFSmBxyTlYqYhm0Tvk0xYt3uLKuDsTNPyU9ixW2Ldz89DeIkNZ_0oTG4yaQOOr2UDKDi8wWRQsg7n3y_8w0yZi5jtFqrcgqHiaICYkObz45YG0ivqxPvXVJZwm5BP",
                "Action / Cyberpunk", 119, new BigDecimal("7.9"))
        );
    }

    private static List<Theater> buildTheaters() {
        return List.of(
            new Theater(1L, "Cinemist Prime", "Taipei Main Station", 72),
            new Theater(2L, "Digital Plaza", "Soho", 72)
        );
    }

    /** 每個影廳 6 排（A-F）× 12 座 = 72 席，共 2 個影廳 144 個座位。 */
    private static List<Seat> buildSeats(List<Theater> theaters) {
        List<Seat> list = new ArrayList<>();
        String[] rows = {"A", "B", "C", "D", "E", "F"};
        long seatId = 1;
        for (Theater t : theaters) {
            for (String row : rows) {
                for (int n = 1; n <= 12; n++) {
                    list.add(new Seat(seatId++, t.id(), row, n));
                }
            }
        }
        return Collections.unmodifiableList(list);
    }

    private static List<Showtime> buildShowtimes() {
        BigDecimal price = new BigDecimal("18.50");
        return List.of(
            new Showtime(1L,  1L, 1L, LocalDateTime.of(2026, 6, 21, 14, 30), price),
            new Showtime(2L,  1L, 1L, LocalDateTime.of(2026, 6, 21, 17, 45), price),
            new Showtime(3L,  1L, 1L, LocalDateTime.of(2026, 6, 22, 21,  0), price),
            new Showtime(4L,  2L, 1L, LocalDateTime.of(2026, 6, 21, 12,  0), price),
            new Showtime(5L,  2L, 1L, LocalDateTime.of(2026, 6, 22, 15, 15), price),
            new Showtime(6L,  2L, 1L, LocalDateTime.of(2026, 6, 23, 18, 30), price),
            new Showtime(7L,  3L, 1L, LocalDateTime.of(2026, 6, 21, 22,  0), price),
            new Showtime(8L,  3L, 1L, LocalDateTime.of(2026, 6, 22, 16,  0), price),
            new Showtime(9L,  3L, 1L, LocalDateTime.of(2026, 6, 23, 19, 30), price),
            new Showtime(10L, 4L, 1L, LocalDateTime.of(2026, 6, 21, 18, 30), price),
            new Showtime(11L, 4L, 1L, LocalDateTime.of(2026, 6, 22, 22, 45), price),
            new Showtime(12L, 4L, 1L, LocalDateTime.of(2026, 6, 23, 14, 30), price),
            new Showtime(13L, 5L, 1L, LocalDateTime.of(2026, 6, 21, 16,  0), price),
            new Showtime(14L, 5L, 1L, LocalDateTime.of(2026, 6, 22, 19, 30), price),
            new Showtime(15L, 5L, 1L, LocalDateTime.of(2026, 6, 23, 21,  0), price)
        );
    }
}

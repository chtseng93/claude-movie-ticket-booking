INSERT INTO movie (title, description, poster_url, genre, duration_minutes, rating) VALUES
('NEON RISING',
 'In a world where digital consciousness has become the ultimate currency, one operative must dive into the core of a decaying metropolis to retrieve a lost memory that could rewrite humanity''s future.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv23QzNciA2C68LlgJE4KtKUfxFB1NZt9ggmuFYpiYBLLJVuQl21duTHJKG8FNvWt56FDXCek-IGXS9JoB6-BOY10rY_y-bdPbFcrmJk_Ayayrmwp8BevMMVXOk38QwghxoIne8QOCvoFmOR3U9y1LbCu090zaBtenFQhihYVxggiI5R1AIaVHlRNeKvXHwWyt_1k-qEx7iyzcbbzwt9s1PSzODCiPRLnJPlSN3yxKOSor7M9cCilHNY5WfFXr-dnO42pb33Piymkp',
 'Sci-Fi / Action', 165, 9.2),

('THE GATEWAY',
 'A portal to an unknown dimension opens, and the team that built it must decide whether to step through.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXSvPq2gFXjzwYNtL4wfMZJC3dk7WbwDpXsDVRk145NCMWsXlRoW4-SVEhujnterHngd5s181TE8GIQSPtVVdRKq6TagTBTvhDYBqXx9bMMfYg84dn0gHYm6gGKE6OYnOM1z8BjA0CYZbhJNEKD_eWRLQ2F1IseZpveYyILqlt_Seht2BmdQ0yBlxUa3rkpKFDpuHq7WC06GIHg4BU8kv7c-q-RdQHkvkyhHe0NQDRpRTigLfx9vkZ0nMqGPw5bRYwm25DBPUwJX1x',
 'Sci-Fi / Thriller', 142, 8.7),

('VOID RUNNERS',
 'Smugglers race across the dead zones of deep space, one jump ahead of the law and the dark.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKumN51JDLgQXHh3pTbdcWN0upM0mccVfHeQjVEIfFX1bokg_SrgqMpzze0ixFSrCMnnjn2jfZIy9fIvqlD4QPwc_0KDE8OSPtJeZwiMFG3ae89rQir41Kq9mQI9p7nyjJlYGCTEnWJB7gxlARFnQ_40txPelD8eTHIzBpeKa_hp49kGHsB5qzEYcp3yT0hKrxbu7Y0itg6TJmBPi6r95UcykzfQheQSTp-joEFjqRr9mr7KiTrfKYstGq6yg0lAoNI4F737d4XVPD',
 'Action / Space', 128, 8.2),

('SYNAPTIC',
 'A neuroscientist uncovers a memory that was never hers, and the people who will kill to keep it buried.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG542Y9ctBruPN-eotH3FsZCIT5lRvyj4H22FWTzRYOvB5pYvDjjq2vC4qWmT9wAq-DeznOWOOMkLLeJ_V91hmjHgfu_2CJ9LYKdkNvXMaAQVzKsn59Nsz7kPXXOyBAXfGd0ErLjpiFUPfYjIPI7qfw8X4G9MDAJxKD3fWrdRkWuXijuVjiXamYB8giJgUmXA4h5NXntT_qoYFUJmPdqbbt1BjnCoN7Mg1GkOCREfPjieUdgy8JMEK1-xk7v_ywcGg2pt2wbOinv22',
 'Thriller / Drama', 137, 9.0),

('KINETIC EDGE',
 'On the neon streets of a divided city, a courier becomes the only thing standing between order and collapse.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvvOtfQmm8Atc5rStHLnByywbiax9Luq93YnEK6n7NsXQf8dNf5akEsv6RrLns10aBWuGqERYbLs0dbzo77wzl-1F_htWMEvfyjBBDspJx97Of5H5wy2_fnkNj-HPiKDCo5eUd00NMZuRzgelFSmBxyTlYqYhm0Tvk0xYt3uLKuDsTNPyU9ixW2Ldz89DeIkNZ_0oTG4yaQOOr2UDKDi8wWRQsg7n3y_8w0yZi5jtFqrcgqHiaICYkObz45YG0ivqxPvXVJZwm5BP',
 'Action / Cyberpunk', 119, 7.9);

INSERT INTO theater (name, location, total_seats) VALUES
('Cinemist Prime', 'Taipei Main Station', 72),
('Digital Plaza', 'Soho', 72);

-- 72 seats per theater: rows A-F × seats 1-12
INSERT INTO seat (theater_id, row_label, seat_number)
SELECT t.id, r.row_label, s.seat_number
FROM theater t
CROSS JOIN (VALUES ('A'),('B'),('C'),('D'),('E'),('F')) AS r(row_label)
CROSS JOIN generate_series(1, 12) AS s(seat_number);

-- 15 showtimes: 3 per movie, all in theater 1, price 18.50
INSERT INTO showtime (movie_id, theater_id, start_time, price) VALUES
(1, 1, '2026-06-21 14:30:00', 18.50),
(1, 1, '2026-06-21 17:45:00', 18.50),
(1, 1, '2026-06-22 21:00:00', 18.50),
(2, 1, '2026-06-21 12:00:00', 18.50),
(2, 1, '2026-06-22 15:15:00', 18.50),
(2, 1, '2026-06-23 18:30:00', 18.50),
(3, 1, '2026-06-21 22:00:00', 18.50),
(3, 1, '2026-06-22 16:00:00', 18.50),
(3, 1, '2026-06-23 19:30:00', 18.50),
(4, 1, '2026-06-21 18:30:00', 18.50),
(4, 1, '2026-06-22 22:45:00', 18.50),
(4, 1, '2026-06-23 14:30:00', 18.50),
(5, 1, '2026-06-21 16:00:00', 18.50),
(5, 1, '2026-06-22 19:30:00', 18.50),
(5, 1, '2026-06-23 21:00:00', 18.50);

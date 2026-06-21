DROP TABLE IF EXISTS booking_seat, booking, showtime, seat, theater, movie CASCADE;

CREATE TABLE movie (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    poster_url VARCHAR(1000),
    genre VARCHAR(255),
    duration_minutes INT,
    rating NUMERIC(3,1)
);

CREATE TABLE theater (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    total_seats INT
);

CREATE TABLE seat (
    id BIGSERIAL PRIMARY KEY,
    theater_id BIGINT NOT NULL REFERENCES theater(id),
    row_label VARCHAR(2) NOT NULL,
    seat_number INT NOT NULL
);

CREATE TABLE showtime (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL REFERENCES movie(id),
    theater_id BIGINT NOT NULL REFERENCES theater(id),
    start_time TIMESTAMP NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE booking (
    id BIGSERIAL PRIMARY KEY,
    booking_number VARCHAR(32) NOT NULL UNIQUE,
    showtime_id BIGINT NOT NULL REFERENCES showtime(id),
    email VARCHAR(255) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE booking_seat (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(id),
    showtime_id BIGINT NOT NULL REFERENCES showtime(id),
    seat_id BIGINT NOT NULL REFERENCES seat(id),
    CONSTRAINT uq_showtime_seat UNIQUE (showtime_id, seat_id)
);

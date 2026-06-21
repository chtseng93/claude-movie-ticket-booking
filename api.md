# API Documentation — Cinemist

- Backend: `http://localhost:8085`
- Frontend: `http://localhost:5175`
- Base path: `/api`

---

## Movies

### GET /api/movies
Get all movies.

**Response 200**
```json
[
  {
    "id": 1,
    "title": "NEON RISING",
    "description": "In a world where digital consciousness...",
    "posterUrl": "https://...",
    "genre": "Sci-Fi / Action",
    "durationMinutes": 165,
    "rating": 9.2
  }
]
```

### GET /api/movies/:id
Get single movie.

**Response 200**
```json
{
  "id": 1,
  "title": "NEON RISING",
  "description": "...",
  "posterUrl": "https://...",
  "genre": "Sci-Fi / Action",
  "durationMinutes": 165,
  "rating": 9.2
}
```

**Response 404**
```json
{ "error": "Movie not found" }
```

---

## Showtimes

### GET /api/movies/:movieId/showtimes
Get all showtimes for a movie, grouped by date.

**Response 200**
```json
[
  {
    "id": 1,
    "movieId": 1,
    "theater": {
      "id": 1,
      "name": "Cinemist Prime",
      "location": "Taipei Main Station"
    },
    "startTime": "2026-06-21T19:30:00",
    "price": 18.50
  }
]
```

---

## Seats

### GET /api/showtimes/:showtimeId/seats
Get all seats for a showtime with availability status.

**Response 200**
```json
[
  {
    "seatId": 1,
    "rowLabel": "A",
    "seatNumber": 1,
    "status": "AVAILABLE"
  },
  {
    "seatId": 2,
    "rowLabel": "A",
    "seatNumber": 2,
    "status": "SOLD"
  }
]
```

---

## Bookings

### POST /api/bookings
Create a booking. Server calculates total amount — do not send price from client.

**Request**
```json
{
  "showtimeId": 1,
  "seatIds": [1, 2],
  "email": "user@example.com"
}
```

**Response 201**
```json
{
  "bookingNumber": "CNM-20260621-A3F9",
  "showtimeId": 1,
  "email": "user@example.com",
  "totalAmount": 37.00,
  "seats": [
    { "rowLabel": "A", "seatNumber": 1 },
    { "rowLabel": "A", "seatNumber": 2 }
  ],
  "createdAt": "2026-06-21T14:00:00"
}
```

**Response 409** — seat already taken
```json
{ "error": "Seat A1 is already sold" }
```

**Response 400** — validation error
```json
{ "error": "seatIds must not be empty" }
```

### GET /api/bookings/:bookingNumber
Lookup booking by booking number (for ticket page).

**Response 200**
```json
{
  "bookingNumber": "CNM-20260621-A3F9",
  "movie": {
    "title": "NEON RISING",
    "posterUrl": "https://..."
  },
  "showtime": {
    "startTime": "2026-06-21T19:30:00",
    "theater": {
      "name": "Cinemist Prime",
      "location": "Taipei Main Station"
    }
  },
  "email": "user@example.com",
  "totalAmount": 37.00,
  "seats": [
    { "rowLabel": "A", "seatNumber": 1 },
    { "rowLabel": "A", "seatNumber": 2 }
  ],
  "createdAt": "2026-06-21T14:00:00"
}
```

**Response 404**
```json
{ "error": "Booking not found" }
```

---

## Error Format

All errors follow:
```json
{
  "error": "Human-readable message"
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation failed |
| 404 | Resource not found |
| 409 | Seat conflict (already sold) |
| 500 | Internal server error |

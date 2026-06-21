# System Specification — Cinemist Movie Ticket Booking

## 1. Architecture & Technology Selection

| Layer | Technology | Reason |
|-------|-----------|--------|
| Backend | Java 17 + Spring Boot 3.x | LTS, mature ecosystem, JPA integration |
| Frontend | React + Vite | Fast HMR, component-based UI |
| Database | PostgreSQL 18 (Docker) | ACID transactions, seat concurrency safety |
| ORM | Spring Data JPA (Hibernate) | Entity mapping, query abstraction |
| Build | Maven (backend) / npm (frontend) | Standard toolchain |
| Container | Docker Compose | Local dev parity |

---

## 2. Data Model

| Entity | Key Fields |
|--------|-----------|
| `Movie` | id, title, description, posterUrl, genre, duration, rating |
| `Theater` | id, name, location, totalSeats |
| `Seat` | id, theaterId, rowLabel, seatNumber |
| `Showtime` | id, movieId, theaterId, startTime, price |
| `Booking` | id, bookingNumber, showtimeId, email, totalAmount, createdAt |
| `BookingSeat` | id, bookingId, showtimeId, seatId — unique(showtimeId, seatId) |

### 2.1 Initial Movie Data (from `movieinfo_neon.html`)

Seed data in `data.sql` must use the following movies exactly:

| Title | Genre | Rating | Poster |
|-------|-------|--------|--------|
| NEON RISING | Sci-Fi / Action | 9.2 | `https://lh3.googleusercontent.com/aida-public/AB6AXuC6o0Yz_xmN9X3G...` |
| THE GATEWAY | Sci-Fi / Thriller | 8.7 | `https://lh3.googleusercontent.com/aida-public/AB6AXuDXSvPq2gFXjzwY...` |
| VOID RUNNERS | Action / Space | 8.2 | `https://lh3.googleusercontent.com/aida-public/AB6AXuBKumN51JDLgQXH...` |
| SYNAPTIC | Thriller / Drama | 9.0 | `https://lh3.googleusercontent.com/aida-public/AB6AXuCG542Y9ctBruPN...` |
| KINETIC EDGE | Action / Cyberpunk | 7.9 | `https://lh3.googleusercontent.com/aida-public/AB6AXuDmvvOtfQmm8Atc...` |

> Full image URLs are in `design/movieinfo_neon.html`. Do not alter or proxy them.

---

## 3. Key Flows

### 3.1 Seat Booking Flow

```mermaid
flowchart TD
    A[User selects movie] --> B[Select date & showtime]
    B --> C[View seat map]
    C --> D{Seat available?}
    D -- No --> E[Show as occupied]
    D -- Yes --> F[User selects seats]
    F --> G[Enter email]
    G --> H[Submit booking]
    H --> I{DB check: seats still free?}
    I -- No --> J[Return conflict error]
    I -- Yes --> K[Server calculates total]
    K --> L[Create Booking + BookingSeat records]
    L --> M[Mark seats SOLD]
    M --> N[Return booking number]
    N --> O[Show ticket + fake QR]
```

### 3.2 Order Lookup Flow

```mermaid
flowchart TD
    A[User enters booking number] --> B[GET /api/bookings/:bookingNumber]
    B --> C{Found?}
    C -- No --> D[404 Not Found]
    C -- Yes --> E[Return booking + seat details]
    E --> F[Render ticket page with QR]
```

---

## 4. Pseudocode

### POST /api/bookings

A booking_seat row existing for (showtimeId, seatId) means that seat is sold.
Double-booking is prevented by a UNIQUE(showtime_id, seat_id) DB constraint —
the database rejects the duplicate even under concurrent first-time inserts,
which a SELECT FOR UPDATE on not-yet-existing rows cannot.

```
function createBooking(showtimeId, seatIds[], email):
  showtime = findShowtime(showtimeId)          // 404 if missing
  totalAmount = showtime.price * seatIds.length
  bookingNumber = generateBookingNumber()      // see api.md: CNM-YYYYMMDD-XXXX

  BEGIN TRANSACTION
    booking = insert Booking(bookingNumber, showtimeId, email, totalAmount)
    try:
      for each seatId in seatIds:
        insert BookingSeat(booking.id, showtimeId, seatId)
    catch UniqueConstraintViolation:
      ROLLBACK
      throw ConflictException("Seat already taken")
  COMMIT

  return booking
```

---

## 5. System Context Diagram

```mermaid
C4Context
    title System Context — Cinemist

    Person(user, "User", "Browses movies, books seats, views tickets")
    System(cinemist, "Cinemist", "Movie ticket booking platform")
    SystemDb(db, "PostgreSQL", "Stores movies, showtimes, bookings")

    Rel(user, cinemist, "Uses", "HTTP/HTTPS")
    Rel(cinemist, db, "Reads/Writes", "JDBC")
```

---

## 6. Container / Deployment Overview

All three services are orchestrated by Docker Compose.
The browser only talks to nginx (port 5175); nginx proxies `/api/*` to the backend container internally — no CORS needed.

```mermaid
C4Container
    title Container View (Docker Compose)

    Person(user, "User", "Browser")

    Container(frontend, "Frontend", "nginx + React build", "Serves static files; proxies /api to backend")
    Container(backend, "Backend", "Spring Boot JAR", "REST API, booking logic")
    ContainerDb(db, "Database", "PostgreSQL 18", "All persistent data")

    Rel(user, frontend, "Visits", "HTTP :5175")
    Rel(frontend, backend, "proxy /api/*", "HTTP backend:8085 (internal)")
    Rel(backend, db, "SQL", "JDBC db:5432 (internal)")
```

### Port mapping
| Service | Container port | Host port |
|---------|---------------|-----------|
| nginx (frontend) | 80 | **5175** |
| Spring Boot (backend) | 8085 | 8085 (optional, for direct dev access) |
| PostgreSQL | 5432 | 5432 (optional, for DB tools) |

### Dev vs Docker
| Mode | Frontend | API calls |
|------|----------|-----------|
| `npm run dev` | Vite :5175, proxy `/api` → `localhost:8085` | Vite proxy |
| `docker compose up` | nginx :5175, proxy `/api` → `backend:8085` | nginx proxy |

Same frontend code works in both modes (relative `/api/...` URLs).

---

## 7. Module Relationship

### Backend

```mermaid
graph TD
    Controller --> Service
    Service --> Repository
    Repository --> Entity
    Entity --> DB[(PostgreSQL)]

    subgraph Controllers
        MovieController
        ShowtimeController
        BookingController
    end

    subgraph Services
        MovieService
        ShowtimeService
        BookingService
    end

    subgraph Repositories
        MovieRepo
        ShowtimeRepo
        BookingRepo
        BookingSeatRepo
        SeatRepo
    end
```

### Frontend

```mermaid
graph TD
    App --> Router
    Router --> MoviePage
    Router --> DatePage
    Router --> CheckoutPage
    Router --> TicketPage

    MoviePage --> MovieAPI
    DatePage --> ShowtimeAPI
    CheckoutPage --> SeatAPI
    CheckoutPage --> BookingAPI
    TicketPage --> BookingAPI
```

---

## 8. Sequence Diagram

### Seat Booking

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Select seats + enter email
    Frontend->>Backend: POST /api/bookings {showtimeId, seatIds, email}
    Backend->>DB: BEGIN TRANSACTION
    Backend->>DB: INSERT Booking (server-computed total)
    Backend->>DB: INSERT BookingSeat per seat
    alt UNIQUE(showtime_id, seat_id) violated
        DB-->>Backend: constraint error
        Backend->>DB: ROLLBACK
        Backend-->>Frontend: 409 Conflict
        Frontend-->>User: "Seat already taken"
    else All inserts succeed
        Backend->>DB: COMMIT
        Backend-->>Frontend: 201 {bookingNumber, totalAmount}
        Frontend-->>User: Redirect to /ticket/:bookingNumber
    end
```

---

## 9. ER Diagram

```mermaid
erDiagram
    MOVIE {
        bigint id PK
        varchar title
        text description
        varchar poster_url
        varchar genre
        int duration_minutes
        decimal rating
    }

    THEATER {
        bigint id PK
        varchar name
        varchar location
        int total_seats
    }

    SEAT {
        bigint id PK
        bigint theater_id FK
        char row_label
        int seat_number
    }

    SHOWTIME {
        bigint id PK
        bigint movie_id FK
        bigint theater_id FK
        timestamp start_time
        decimal price
    }

    BOOKING {
        bigint id PK
        varchar booking_number UK
        bigint showtime_id FK
        varchar email
        decimal total_amount
        timestamp created_at
    }

    BOOKING_SEAT {
        bigint id PK
        bigint booking_id FK
        bigint showtime_id FK
        bigint seat_id FK
    }

    MOVIE ||--o{ SHOWTIME : "has"
    THEATER ||--o{ SEAT : "has"
    THEATER ||--o{ SHOWTIME : "hosts"
    SHOWTIME ||--o{ BOOKING : "has"
    SHOWTIME ||--o{ BOOKING_SEAT : "sells"
    BOOKING ||--o{ BOOKING_SEAT : "contains"
    SEAT ||--o{ BOOKING_SEAT : "referenced by"
```

> `BOOKING_SEAT` carries `showtime_id` (denormalized from `BOOKING`) so a
> `UNIQUE(showtime_id, seat_id)` constraint can enforce one-sale-per-seat at the
> DB level. A row's existence means the seat is sold; there is no status column.

---

## 10. Class Diagram

```mermaid
classDiagram
    class Movie {
        +Long id
        +String title
        +String description
        +String posterUrl
        +String genre
        +int durationMinutes
        +BigDecimal rating
    }

    class Theater {
        +Long id
        +String name
        +String location
        +int totalSeats
    }

    class Seat {
        +Long id
        +Theater theater
        +char rowLabel
        +int seatNumber
    }

    class Showtime {
        +Long id
        +Movie movie
        +Theater theater
        +LocalDateTime startTime
        +BigDecimal price
    }

    class Booking {
        +Long id
        +String bookingNumber
        +Showtime showtime
        +String email
        +BigDecimal totalAmount
        +LocalDateTime createdAt
    }

    class BookingSeat {
        +Long id
        +Booking booking
        +Showtime showtime
        +Seat seat
    }

    Movie "1" --> "many" Showtime
    Theater "1" --> "many" Seat
    Theater "1" --> "many" Showtime
    Showtime "1" --> "many" Booking
    Showtime "1" --> "many" BookingSeat
    Booking "1" --> "many" BookingSeat
    Seat "1" --> "many" BookingSeat
```

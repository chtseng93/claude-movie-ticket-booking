package com.cinemist.web;

import com.cinemist.dto.BookingResponse;
import com.cinemist.dto.CreateBookingRequest;
import com.cinemist.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookings;
    public BookingController(BookingService bookings) { this.bookings = bookings; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody CreateBookingRequest req) {
        return bookings.create(req);
    }

    @GetMapping("/{bookingNumber}")
    public BookingResponse get(@PathVariable String bookingNumber) {
        return bookings.findByNumber(bookingNumber);
    }
}

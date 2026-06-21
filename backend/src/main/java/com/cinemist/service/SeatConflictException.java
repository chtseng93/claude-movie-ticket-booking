package com.cinemist.service;

/** 座位已被購買，對應 HTTP 409。 */
public class SeatConflictException extends RuntimeException {
    public SeatConflictException(String message) { super(message); }
}

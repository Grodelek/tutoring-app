package com.tutoring.app.config;

/** Signals syntactically valid input that violates an endpoint's request contract. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

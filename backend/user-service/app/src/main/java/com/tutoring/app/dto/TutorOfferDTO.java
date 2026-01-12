package com.tutoring.app.dto;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class TutorOfferDTO {
    private UUID tutorId;
    private Long subjectId;
    private String level;
    private String city;
    private boolean online;
    private BigDecimal pricePerHour;
    private double rating;
    private int lessonCount;

}

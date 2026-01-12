package com.tutoring.app.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorOffer {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private User tutor;

    @ManyToOne(optional = false)
    private Subject subject;

    @Column(nullable = false)
    private String level;

    private String city;

    private boolean online;

    @Column(nullable = false)
    private BigDecimal pricePerHour;

    private double rating;
    private int lessonsCount;
}

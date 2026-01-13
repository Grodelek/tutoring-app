package com.tutoring.app.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(optional = false)
    private User tutor;

    @ManyToOne(optional = false)
    private User student;

    @ManyToOne(optional = false)
    private Lesson lesson;

    private LocalDateTime sessionStartTime;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean accepted = false;

}

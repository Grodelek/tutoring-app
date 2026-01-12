package com.tutoring.app.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(optional = false)
  private TutorOffer offer;

  @ManyToOne(optional = false)
  private User student;

  private LocalDateTime startTime;
  private int durationMinutes;

  @Enumerated(EnumType.STRING)
  private LessonStatus status;

  private BigDecimal price;
}

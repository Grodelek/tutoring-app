package com.tutoring.app.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
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

  @ManyToOne(optional = true)
  @JoinColumn(name = "student_id", nullable = true)
  private User student;

  @ManyToOne(optional = false)
  private User tutor;

  private String subject;

  private LocalDateTime startTime;
  private int durationMinutes;

  @Enumerated(EnumType.STRING)
  private LessonStatus status;

  private BigDecimal price;
  private String description;
  private int durationTime;
}

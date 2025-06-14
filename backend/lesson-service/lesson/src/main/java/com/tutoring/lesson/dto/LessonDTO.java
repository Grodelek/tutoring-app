package com.tutoring.lesson.dto;

import java.util.UUID;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class LessonDTO {
  private String subject;
  private String description;
  private int durationTime;
  private UUID tutorId;
}

package com.tutoring.lesson.dto;

import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonResponseDTO {
  private UUID id;
  private String subject;
  private String description;
  private Integer durationTime;
  private UUID tutorId;
}

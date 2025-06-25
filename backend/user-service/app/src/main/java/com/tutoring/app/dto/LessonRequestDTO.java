package com.tutoring.app.dto;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonRequestDTO {
  private String subject;
  private String description;
  private int durationTime;
  private UUID tutorId;
}

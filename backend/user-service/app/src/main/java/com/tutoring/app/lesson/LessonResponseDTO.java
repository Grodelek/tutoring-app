package com.tutoring.app.lesson;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;

@Getter @Setter
public class LessonResponseDTO {
  private UUID id;
  private String subject;
  private String description;
  private Integer durationTime;
  private BigDecimal price;
  private UUID tutorId;
}

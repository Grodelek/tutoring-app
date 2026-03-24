package com.tutoring.app.dto;

import java.math.BigDecimal;
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
  private BigDecimal price;
  private UUID tutorId;
}

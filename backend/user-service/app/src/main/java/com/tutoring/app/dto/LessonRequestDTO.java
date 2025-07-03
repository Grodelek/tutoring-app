package com.tutoring.app.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonRequestDTO {
  @NotBlank
  @Size(min = 4)
  private String subject;
  @NotBlank
  @Size(min = 4)
  private String description;
  @NotNull
  private int durationTime;
  private UUID tutorId;
}

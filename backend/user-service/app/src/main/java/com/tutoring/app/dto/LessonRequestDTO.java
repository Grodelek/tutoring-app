package com.tutoring.app.dto;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class LessonRequestDTO {
  @NotBlank
  @Size(min = 4)
  private String subject;
  @NotNull
  private int durationTime;
  @NotNull
  private BigDecimal price;
  @NotBlank
  @Size(min = 4)
  private String description;
}

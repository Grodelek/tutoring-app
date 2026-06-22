package com.tutoring.app.lesson;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import lombok.*;

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

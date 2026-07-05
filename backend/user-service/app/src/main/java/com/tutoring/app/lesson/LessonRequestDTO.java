package com.tutoring.app.lesson;

import io.swagger.v3.oas.annotations.media.Schema;
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
  @Schema(example = "Mathematics")
  private String subject;
  @NotNull
  @Schema(example = "60", description = "Duration in minutes")
  private int durationTime;
  @NotNull
  @Schema(example = "79.99")
  private BigDecimal price;
  @NotBlank
  @Size(min = 4)
  @Schema(example = "Algebra and calculus for high school students")
  private String description;
}

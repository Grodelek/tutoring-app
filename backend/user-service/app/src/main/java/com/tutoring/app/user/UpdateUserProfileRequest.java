package com.tutoring.app.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserProfileRequest {
  @Size(min = 5, max = 20)
  @Schema(example = "johndoe")
  private String username;
  @Size(max = 150)
  @Schema(example = "Experienced math tutor with 5 years of teaching high school students")
  private String description;
}

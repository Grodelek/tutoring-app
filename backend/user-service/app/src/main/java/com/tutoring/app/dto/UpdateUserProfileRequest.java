package com.tutoring.app.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserProfileRequest {
  @Size(min = 5, max = 20)
  private String username;
  @Size(max = 150)
  private String description;
}

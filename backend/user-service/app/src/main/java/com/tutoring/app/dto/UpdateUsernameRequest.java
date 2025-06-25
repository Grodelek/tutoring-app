package com.tutoring.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUsernameRequest {
  @NotBlank(message = "Username is required")
  private String username;
}

package com.tutoring.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
  @NotBlank
  private String email;
  @NotBlank
  private String password;
  @NotBlank
  private String username;
}

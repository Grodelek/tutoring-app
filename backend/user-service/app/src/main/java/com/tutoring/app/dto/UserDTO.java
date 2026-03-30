package com.tutoring.app.dto;

import com.tutoring.app.domain.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
  @NotBlank
  @Pattern(regexp = "^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
  private String email;
  @NotBlank
  @Size(min = 9, max = 50)
  private String password;
  @NotBlank
  @Size(min = 6, max = 50)
  private String username;
  @NotNull
  private UserType userType;
}

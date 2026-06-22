package com.tutoring.app.user;

import jakarta.validation.constraints.*;
import lombok.*;

@NoArgsConstructor @Getter @Setter
public class UserLoginDTO {
  @NotBlank @Pattern(regexp = "^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
  private String email;
  @NotBlank @Size(min = 9, max = 50)
  private String password;
  @NotBlank @Size(min = 6, max = 50)
  private String username;
  @NotNull
  private UserType userType;
}

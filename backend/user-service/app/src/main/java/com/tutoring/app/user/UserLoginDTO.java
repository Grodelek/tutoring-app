package com.tutoring.app.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@NoArgsConstructor
@Getter
@Setter
public class UserLoginDTO {
  @NotBlank
  @Pattern(regexp = "^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
  @Schema(example = "john.doe@gmail.com")
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

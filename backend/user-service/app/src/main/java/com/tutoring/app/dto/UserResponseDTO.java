package com.tutoring.app.dto;

import java.util.UUID;
import com.tutoring.app.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserResponseDTO {
  private UUID id;
  private String username;
  private String email;
  private String photoPath;
  private int points;
  private String description;
}

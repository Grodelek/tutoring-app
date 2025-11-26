package com.tutoring.app.dto;

import java.util.UUID;
import com.tutoring.app.domain.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UserResponseDTO {
  private UUID id;
  private String username;
  private String email;
  private String photoPath;
  private int points;
  private String description;

  public UserResponseDTO(User user) {
    this.id = user.getId();
    this.username = user.getUsername();
    this.email = user.getEmail();
    this.photoPath = user.getPhotoPath();
    this.points = user.getPoints();
    this.description = user.getDescription();
  }
}

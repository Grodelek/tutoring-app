package com.tutoring.app.dto;

import java.util.UUID;
import com.tutoring.app.model.User;
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

  public UserResponseDTO(User user) {
    this.id = user.getId();
    this.username = user.getUsername();
    this.email = user.getEmail();
    this.photoPath = user.getPhotoPath();
  }
}

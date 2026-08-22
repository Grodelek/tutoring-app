package com.tutoring.app.user;

import java.util.UUID;
import lombok.Builder;

@Builder
public record UserDTO(
  UUID id,
  String username,
  String email,
  String photoPath,
  int points,
  String description,
  int streak
) {}

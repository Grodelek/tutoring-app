package com.tutoring.app.favorite;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FavoriteTutorDTO {
  private UUID id;
  private UUID studentId;
  private UUID tutorId;
  private String tutorUsername;
  private String tutorPhotoPath;
  private String tutorDescription;

  public FavoriteTutorDTO(UUID id, UUID studentId, UUID tutorId) {
    this.id = id; this.studentId = studentId; this.tutorId = tutorId;
  }
}

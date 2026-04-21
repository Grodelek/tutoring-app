package com.tutoring.app.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteTutorDTO {

  private UUID id;
  private UUID studentId;
  private UUID tutorId;

  private String tutorUsername;
  private String tutorPhotoPath;
  private String tutorDescription;

  public FavoriteTutorDTO(UUID id, UUID studentId, UUID tutorId) {
    this.id = id;
    this.studentId = studentId;
    this.tutorId = tutorId;
  }
}


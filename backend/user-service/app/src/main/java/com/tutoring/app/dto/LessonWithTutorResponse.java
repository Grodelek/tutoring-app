package com.tutoring.app.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class LessonWithTutorResponse {
  private UUID id;
  private String subject;
  private String description;
  private int durationTime;

  private UUID tutorId;
  private String tutorEmail;
  private String tutorUsername;
  private String tutorPhotoPath;
}

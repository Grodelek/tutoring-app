package com.tutoring.app.lesson;

import java.util.UUID;
import lombok.*;

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

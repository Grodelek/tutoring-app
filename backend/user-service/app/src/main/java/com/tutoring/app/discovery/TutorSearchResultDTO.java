package com.tutoring.app.discovery;

import com.tutoring.app.user.Availability;
import com.tutoring.app.user.LessonType;
import com.tutoring.app.user.UserType;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorSearchResultDTO {
  private UUID tutorId;
  private String tutorUsername;
  private String tutorPhotoPath;
  private String tutorDescription;
  private UUID lessonId;
  private String subject;
  private String lessonDescription;
  private Integer durationTime;
  private BigDecimal price;
  private Double rating;
  private LessonType tutorTeachingStyle;
  private UserType tutorUserType;
  private Availability tutorAvailability;
}

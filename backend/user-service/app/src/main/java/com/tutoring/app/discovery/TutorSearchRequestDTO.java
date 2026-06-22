package com.tutoring.app.discovery;

import com.tutoring.app.user.Availability;
import com.tutoring.app.user.LessonType;
import com.tutoring.app.user.UserType;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class TutorSearchRequestDTO {
  private UUID userId;
  private String subject;
  private String level;
  private BigDecimal minPrice;
  private BigDecimal maxPrice;
  private LessonType preferredTeachingStyle;
  private UserType preferredUserType;
  private Availability preferredAvailability;
}

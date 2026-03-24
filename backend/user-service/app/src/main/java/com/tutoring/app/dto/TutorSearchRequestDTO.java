package com.tutoring.app.dto;

import com.tutoring.app.domain.Availability;
import com.tutoring.app.domain.LessonType;
import com.tutoring.app.domain.UserType;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TutorSearchRequestDTO {

  private UUID userId;
  private String subject;
  private String level;
  private BigDecimal minPrice;
  private BigDecimal maxPrice;
  private Double minRating;

  private Integer priceImportance;
  private LessonType preferredTeachingStyle;
  private UserType preferredUserType;
  private Availability preferredAvailability;
}


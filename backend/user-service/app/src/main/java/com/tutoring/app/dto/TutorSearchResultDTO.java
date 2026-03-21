package com.tutoring.app.dto;

import java.math.BigDecimal;
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
}


package com.tutoring.app.dto;

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
}


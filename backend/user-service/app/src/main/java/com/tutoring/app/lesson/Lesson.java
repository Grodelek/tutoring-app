package com.tutoring.app.lesson;

import com.tutoring.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(optional = false)
  private User tutor;

  private String subject;
  private int durationTime;

  private BigDecimal price;
  private String description;
}

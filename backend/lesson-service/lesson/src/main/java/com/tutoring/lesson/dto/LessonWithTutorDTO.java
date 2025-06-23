package com.tutoring.lesson.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class LessonWithTutorDTO {
  private UUID id;
  private String subject;
  private String description;
  private int durationTime;
  private UserDTO tutor;
}

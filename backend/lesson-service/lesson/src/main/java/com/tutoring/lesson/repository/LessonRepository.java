package com.tutoring.lesson.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tutoring.lesson.model.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
  public Lesson getLessonById(UUID id);

}

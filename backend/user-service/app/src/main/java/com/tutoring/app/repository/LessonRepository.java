package com.tutoring.app.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tutoring.app.model.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
  public Lesson getLessonById(UUID id);

}

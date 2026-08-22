package com.tutoring.app.lesson;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
  Lesson getLessonById(UUID id);
  List<Lesson> getLessonByTutorId(UUID tutorId);
}

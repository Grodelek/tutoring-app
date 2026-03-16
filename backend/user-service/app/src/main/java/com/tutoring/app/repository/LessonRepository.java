package com.tutoring.app.repository;

import java.util.List;
import java.util.UUID;

import com.tutoring.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tutoring.app.domain.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
  public Lesson getLessonById(UUID id);
  public List<Lesson> getLessonByTutor(User user);
}

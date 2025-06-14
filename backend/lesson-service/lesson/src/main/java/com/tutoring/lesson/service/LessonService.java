package com.tutoring.lesson.service;

import com.tutoring.lesson.repository.LessonRepository;

public class LessonService {
  private LessonRepository lessonRepository;

  public LessonService(LessonRepository lessonRepository) {
    this.lessonRepository = lessonRepository;
  }

}

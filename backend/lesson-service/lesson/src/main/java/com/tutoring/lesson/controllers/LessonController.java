package com.tutoring.lesson.controllers;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.tutoring.lesson.dto.LessonRequestDTO;
import com.tutoring.lesson.dto.LessonResponseDTO;
import com.tutoring.lesson.dto.LessonWithTutorDTO;
import com.tutoring.lesson.model.Lesson;
import com.tutoring.lesson.service.LessonService;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = { "http://localhost:8081", "exp://192.168.1.32:8081" })
class LessonController {
  private LessonService lessonService;

  LessonController(LessonService lessonService) {
    this.lessonService = lessonService;
  }

  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<LessonResponseDTO> createLesson(@RequestBody LessonRequestDTO lessonRequestDTO) {
    LessonResponseDTO response = lessonService.createLesson(lessonRequestDTO);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/all")
  public List<Lesson> getAllLessons() {
    return lessonService.getAllLessons();
  }

  @GetMapping("/all-with-tutors")
  public ResponseEntity<List<LessonWithTutorDTO>> getAllLessonsWithTutors() {
    List<LessonWithTutorDTO> lessons = lessonService.getLessonsWithTutors();
    return ResponseEntity.ok(lessons);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Lesson> getLessonById(@PathVariable UUID id) {
    return lessonService.getLessonById(id);
  }

  @PutMapping("/{id}")
  public ResponseEntity<LessonResponseDTO> updateLesson(@PathVariable UUID id,
      @RequestBody LessonRequestDTO lessonDTO) {
    return lessonService.updateLesson(id, lessonDTO);
  }

}

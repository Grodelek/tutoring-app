package com.tutoring.app.lesson;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin(origins = {"http://localhost:8081","http://localhost:19006","http://localhost:19000","exp://192.168.2.167:8081"})
@RequestMapping("/api/lessons")
class LessonController {
  private final LessonService lessonService;

  LessonController(LessonService lessonService) { this.lessonService = lessonService; }

  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<LessonResponseDTO> createLesson(@Valid @RequestBody LessonRequestDTO dto) {
    return ResponseEntity.ok(lessonService.createLesson(dto));
  }

  @GetMapping("/all")
  public List<Lesson> getAllLessons() { return lessonService.getAllLessons(); }

  @GetMapping("/all-with-tutors")
  public ResponseEntity<List<LessonWithTutorResponse>> getAllLessonsWithTutors() {
    return ResponseEntity.ok(lessonService.getLessonsWithTutors());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Lesson> getLessonById(@PathVariable UUID id) { return lessonService.getLessonById(id); }

  @GetMapping("/by-tutor/{tutorId}")
  public ResponseEntity<List<Lesson>> getLessonsByTutorId(@PathVariable UUID tutorId) {
    return ResponseEntity.ok(lessonService.getLessonsByTutorId(tutorId));
  }

  @PutMapping("/{id}")
  public ResponseEntity<LessonResponseDTO> updateLesson(@PathVariable UUID id, @Valid @RequestBody LessonRequestDTO dto) {
    return lessonService.updateLesson(id, dto);
  }
}

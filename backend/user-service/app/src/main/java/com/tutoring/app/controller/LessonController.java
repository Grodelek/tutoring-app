package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;

import com.tutoring.app.domain.User;
import com.tutoring.app.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.tutoring.app.dto.LessonRequestDTO;
import com.tutoring.app.dto.LessonResponseDTO;
import com.tutoring.app.dto.LessonWithTutorResponse;
import com.tutoring.app.domain.Lesson;
import com.tutoring.app.service.LessonService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = {
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:19000",
        "exp://192.168.2.167:8081"
})
class LessonController {
  private final UserService userService;
  private LessonService lessonService;

  LessonController(LessonService lessonService, UserService userService) {
    this.lessonService = lessonService;
    this.userService = userService;
  }

  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<LessonResponseDTO> createLesson(@Valid @RequestBody LessonRequestDTO lessonRequestDTO) {
    LessonResponseDTO response = lessonService.createLesson(lessonRequestDTO);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/all")
  public List<Lesson> getAllLessons() {
    return lessonService.getAllLessons();
  }

  @GetMapping("/all-with-tutors")
  public ResponseEntity<List<LessonWithTutorResponse>> getAllLessonsWithTutors() {
    List<LessonWithTutorResponse> lessonsWithTutor = lessonService.getLessonsWithTutors();
    return ResponseEntity.ok(lessonsWithTutor);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Lesson> getLessonById(@PathVariable UUID id) {
    return lessonService.getLessonById(id);
  }

  @GetMapping("/by-tutor")
  public ResponseEntity<List<Lesson>> getLessonByTutor(@AuthenticationPrincipal com.tutoring.app.domain.UserPrincipal userPrincipal){
    if(userPrincipal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    User user = userService.findByUsername(userPrincipal.getUsername());
    return ResponseEntity.ok(lessonService.getLessonsByTutor(user));
  }

  @PutMapping("/{id}")
  public ResponseEntity<LessonResponseDTO> updateLesson(@PathVariable UUID id,
      @Valid @RequestBody LessonRequestDTO lessonDTO) {
    return lessonService.updateLesson(id, lessonDTO);
  }
}

package com.tutoring.app.lesson;

import com.tutoring.app.user.User;
import com.tutoring.app.user.UserPrincipal;
import com.tutoring.app.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j @Service
public class LessonService {
  private final LessonRepository lessonRepository;
  private final UserRepository userRepository;

  public LessonService(LessonRepository lessonRepository, UserRepository userRepository) {
    this.lessonRepository = lessonRepository;
    this.userRepository = userRepository;
  }

  public List<Lesson> getAllLessons() { return lessonRepository.findAll(); }

  public LessonResponseDTO createLesson(LessonRequestDTO dto) {
    User tutor = getLoggedInUser();
    Lesson lesson = Lesson.builder()
            .tutor(tutor).subject(dto.getSubject())
            .durationTime(dto.getDurationTime()).price(dto.getPrice())
            .description(dto.getDescription()).build();
    return mapToResponseDTO(lessonRepository.save(lesson));
  }

  public ResponseEntity<Lesson> getLessonById(UUID id) {
    return lessonRepository.findById(id)
            .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  public List<Lesson> getLessonsByTutorId(UUID tutorId) {
    if (tutorId == null) throw new IllegalArgumentException("tutorId cannot be null");
    return lessonRepository.getLessonByTutorId(tutorId);
  }

  public ResponseEntity<LessonResponseDTO> updateLesson(UUID id, LessonRequestDTO dto) {
    User tutor = getLoggedInUser();
    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isEmpty()) return ResponseEntity.notFound().build();
    Lesson lesson = lessonOptional.get();
    lesson.setSubject(dto.getSubject()); lesson.setDurationTime(dto.getDurationTime());
    lesson.setPrice(dto.getPrice()); lesson.setDescription(dto.getDescription());
    lesson.setTutor(tutor);
    return ResponseEntity.ok(mapToResponseDTO(lessonRepository.save(lesson)));
  }

  public List<LessonWithTutorResponse> getLessonsWithTutors() {
    return lessonRepository.findAll().stream()
        .map(lesson -> LessonWithTutorResponse.builder()
            .id(lesson.getId()).subject(lesson.getSubject()).description(lesson.getDescription())
            .durationTime(lesson.getDurationTime()).tutorId(lesson.getTutor().getId())
            .tutorEmail(lesson.getTutor().getEmail()).tutorUsername(lesson.getTutor().getUsername())
            .tutorPhotoPath(lesson.getTutor().getPhotoPath()).build())
        .collect(Collectors.toList());
  }

  private LessonResponseDTO mapToResponseDTO(Lesson lesson) {
    LessonResponseDTO dto = new LessonResponseDTO();
    dto.setId(lesson.getId()); dto.setSubject(lesson.getSubject());
    dto.setDurationTime(lesson.getDurationTime()); dto.setPrice(lesson.getPrice());
    dto.setDescription(lesson.getDescription()); dto.setTutorId(lesson.getTutor().getId());
    return dto;
  }

  private User getLoggedInUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (!auth.isAuthenticated()) throw new SecurityException("User is not authenticated");
    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
    if (principal == null) throw new EntityNotFoundException("User not found");
    return userRepository.findByUsername(principal.getUsername())
            .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));
  }
}

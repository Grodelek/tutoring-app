package com.tutoring.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.tutoring.app.domain.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.tutoring.app.dto.LessonRequestDTO;
import com.tutoring.app.dto.LessonResponseDTO;
import com.tutoring.app.dto.LessonWithTutorResponse;
import com.tutoring.app.domain.Lesson;
import com.tutoring.app.domain.User;
import com.tutoring.app.repository.LessonRepository;
import com.tutoring.app.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

@Slf4j
@Service
public class LessonService {
  private final LessonRepository lessonRepository;
  private final UserRepository userRepository;

  public LessonService(LessonRepository lessonRepository, UserRepository userRepository) {
    this.lessonRepository = lessonRepository;
    this.userRepository = userRepository;
  }

  public List<Lesson> getAllLessons() {
    return lessonRepository.findAll();
  }

  public LessonResponseDTO createLesson(LessonRequestDTO lessonRequestDTO) {
    User tutor = getLoggedInUser();
    Lesson lesson = Lesson.builder()
            .tutor(tutor)
            .subject(lessonRequestDTO.getSubject())
            .durationTime(lessonRequestDTO.getDurationTime())
            .price(lessonRequestDTO.getPrice())
            .description(lessonRequestDTO.getDescription())
            .build();
    Lesson savedLesson = lessonRepository.save(lesson);
      return mapToResponseDTO(savedLesson);
  }

  public ResponseEntity<Lesson> getLessonById(UUID id) {
    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isPresent()) {
      Lesson lesson = lessonOptional.get();
      return ResponseEntity.ok(lesson);
    }
    return ResponseEntity.notFound().build();
  }

  public List<Lesson> getLessonsByTutorId(UUID tutorId) {
    if (tutorId == null) {
      throw new IllegalArgumentException("tutorId cannot be null");
    }
    return lessonRepository.getLessonByTutorId(tutorId);
  }

  public ResponseEntity<LessonResponseDTO> updateLesson(UUID id, LessonRequestDTO lessonRequestDTO) {
    User tutor = getLoggedInUser();
    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    Lesson lesson = lessonOptional.get();
    lesson.setSubject(lessonRequestDTO.getSubject());
    lesson.setDurationTime(lessonRequestDTO.getDurationTime());
    lesson.setPrice(lessonRequestDTO.getPrice());
    lesson.setDescription(lessonRequestDTO.getDescription());
    lesson.setTutor(tutor);
    Lesson updatedLesson = lessonRepository.save(lesson);
    return ResponseEntity.ok(mapToResponseDTO(updatedLesson));
  }

  public List<LessonWithTutorResponse> getLessonsWithTutors() {
    List<Lesson> lessons = lessonRepository.findAll();
    return lessons.stream()
        .map(lesson -> LessonWithTutorResponse.builder()
            .id(lesson.getId())
            .subject(lesson.getSubject())
            .description(lesson.getDescription())
            .durationTime(lesson.getDurationTime())
            .tutorId(lesson.getTutor().getId())
            .tutorEmail(lesson.getTutor().getEmail())
            .tutorUsername(lesson.getTutor().getUsername())
            .tutorPhotoPath(lesson.getTutor().getPhotoPath())
            .build())
        .collect(Collectors.toList());
  }

  private String getLoggedUsername(){
    Authentication loggedInUser = SecurityContextHolder.getContext().getAuthentication();
    if(!loggedInUser.isAuthenticated()){
      throw new SecurityException("User is not authenticated");
    }
    UserPrincipal principal = (UserPrincipal) loggedInUser.getPrincipal();
    if(principal == null){
      throw new EntityNotFoundException("User not found");
    }
    return principal.getUsername();
  }

  private LessonResponseDTO mapToResponseDTO(Lesson lesson) {
    LessonResponseDTO dto = new LessonResponseDTO();
    dto.setId(lesson.getId());
    dto.setSubject(lesson.getSubject());
    dto.setDurationTime(lesson.getDurationTime());
    dto.setPrice(lesson.getPrice());
    dto.setDescription(lesson.getDescription());
    dto.setTutorId(lesson.getTutor().getId());
    return dto;
  }

  private User getLoggedInUser(){
    String loggedInUsername = getLoggedUsername();
    return userRepository.findByUsername(loggedInUsername)
            .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));
  }
}

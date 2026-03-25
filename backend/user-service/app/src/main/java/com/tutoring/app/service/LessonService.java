package com.tutoring.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.tutoring.app.domain.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
  private static final Logger logger = LoggerFactory.getLogger(LessonService.class);

  public LessonService(LessonRepository lessonRepository, UserRepository userRepository) {
    this.lessonRepository = lessonRepository;
    this.userRepository = userRepository;
  }

  public List<Lesson> getAllLessons() {
    return lessonRepository.findAll();
  }

  public LessonResponseDTO createLesson(LessonRequestDTO lessonRequestDTO) {
    Authentication loggedInUser = SecurityContextHolder.getContext().getAuthentication();
    if (loggedInUser == null){
      throw new EntityNotFoundException("User not found");
    }
    UserPrincipal principal = (UserPrincipal) loggedInUser.getPrincipal();
    String loggedInUsername = principal.getUsername();
    User tutor = userRepository.findByUsername(loggedInUsername)
            .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));

    Lesson lesson = Lesson.builder()
            .tutor(tutor)
            .subject(lessonRequestDTO.getSubject())
            .durationTime(lessonRequestDTO.getDurationTime())
            .price(lessonRequestDTO.getPrice())
            .description(lessonRequestDTO.getDescription())
            .build();
    Lesson savedLesson = lessonRepository.save(lesson);
    LessonResponseDTO response = new LessonResponseDTO();
    response.setId(savedLesson.getId());
    response.setSubject(savedLesson.getSubject());
    response.setDescription(savedLesson.getDescription());
    response.setDurationTime(savedLesson.getDurationTime());
    response.setPrice(savedLesson.getPrice());
    response.setTutorId(savedLesson.getTutor().getId());
    return response;
  }

  public ResponseEntity<Lesson> getLessonById(UUID id) {
    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isPresent()) {
      Lesson lesson = lessonOptional.get();
      return ResponseEntity.ok(lesson);
    }
    return ResponseEntity.notFound().build();
  }

  public List<Lesson> getLessonsByTutor(User user){
    if(user == null) {
      throw new IllegalArgumentException("User cannot be null");
    }
      return user.getLessons();
  }

  public ResponseEntity<LessonResponseDTO> updateLesson(UUID id, LessonRequestDTO lessonRequestDTO) {
    //TODO separate to new method (code duplication)
    Authentication loggedInUser = SecurityContextHolder.getContext().getAuthentication();
    UserPrincipal principal = (UserPrincipal) loggedInUser.getPrincipal();
    String loggedInUsername = principal.getUsername();
    User tutor = userRepository.findByUsername(loggedInUsername)
            .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));

    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isEmpty()) {
      return ResponseEntity.notFound().build();

    }
    Lesson lesson = lessonOptional.get();
    lesson.setSubject(lessonRequestDTO.getSubject());
    lesson.setDurationTime(lessonRequestDTO.getDurationTime());
    lesson.setDescription(lessonRequestDTO.getDescription());
    lesson.setTutor(tutor);
    Lesson updated = lessonRepository.save(lesson);
    LessonResponseDTO responseDTO = new LessonResponseDTO();
    responseDTO.setId(updated.getId());
    responseDTO.setSubject(updated.getSubject());
    responseDTO.setDurationTime(updated.getDurationTime());
    responseDTO.setDescription(updated.getDescription());
    responseDTO.setTutorId(updated.getTutor().getId());
    return ResponseEntity.ok(responseDTO);
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

}

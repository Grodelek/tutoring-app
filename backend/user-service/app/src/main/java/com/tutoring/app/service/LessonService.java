package com.tutoring.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.tutoring.app.dto.LessonRequestDTO;
import com.tutoring.app.dto.LessonResponseDTO;
import com.tutoring.app.dto.LessonWithTutorResponse;
import com.tutoring.app.domain.Lesson;
import com.tutoring.app.domain.User;
import com.tutoring.app.repository.LessonRepository;
import com.tutoring.app.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

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
    User tutor = userRepository.findById(lessonRequestDTO.getTutorId())
        .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));

    Lesson lesson = Lesson.builder()
        .subject(lessonRequestDTO.getSubject())
        .description(lessonRequestDTO.getDescription())
        .tutor(tutor)
        .student(tutor) // Set tutor as student initially (can be updated later when booked)
        .durationTime(lessonRequestDTO.getDurationTime())
        .build();
    Lesson savedLesson = lessonRepository.save(lesson);
    LessonResponseDTO response = new LessonResponseDTO();
    response.setId(savedLesson.getId());
    response.setSubject(savedLesson.getSubject());
    response.setDescription(savedLesson.getDescription());
    response.setDurationTime(savedLesson.getDurationTime());
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

  public ResponseEntity<LessonResponseDTO> updateLesson(UUID id, LessonRequestDTO lessonRequestDTO) {
    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    Lesson lesson = lessonOptional.get();
    User tutor = userRepository.findById(lessonRequestDTO.getTutorId())
        .orElseThrow(
            () -> new EntityNotFoundException("Tutor with id " + lessonRequestDTO.getTutorId() + " not found"));
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

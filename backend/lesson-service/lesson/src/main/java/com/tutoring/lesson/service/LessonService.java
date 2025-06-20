package com.tutoring.lesson.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.tutoring.lesson.dto.LessonRequestDTO;
import com.tutoring.lesson.dto.LessonResponseDTO;
import com.tutoring.lesson.model.Lesson;
import com.tutoring.lesson.repository.LessonRepository;

@Service
public class LessonService {
  private final LessonRepository lessonRepository;
  private final LessonMapper lessonMapper;

  public LessonService(LessonRepository lessonRepository, LessonMapper lessonMapper) {
    this.lessonRepository = lessonRepository;
    this.lessonMapper = lessonMapper;
  }

  public List<Lesson> getAllLessons() {
    return lessonRepository.findAll();
  }

  public LessonResponseDTO createLesson(LessonRequestDTO lessonRequestDTO) {
    Lesson lesson = Lesson.builder()
        .subject(lessonRequestDTO.getSubject())
        .description(lessonRequestDTO.getDescription())
        .tutorId(lessonRequestDTO.getTutorId())
        .durationTime(lessonRequestDTO.getDurationTime())
        .build();
    Lesson savedLesson = lessonRepository.save(lesson);
    LessonResponseDTO response = lessonMapper.toDTO(savedLesson);
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
    lesson.setSubject(lessonRequestDTO.getSubject());
    lesson.setDurationTime(lessonRequestDTO.getDurationTime());
    lesson.setDescription(lessonRequestDTO.getDescription());
    lesson.setTutorId(lessonRequestDTO.getTutorId());
    Lesson updated = lessonRepository.save(lesson);
    return ResponseEntity.ok(lessonMapper.toDTO(updated));
  }
}

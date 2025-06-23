package com.tutoring.lesson.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import com.tutoring.lesson.dto.LessonRequestDTO;
import com.tutoring.lesson.dto.LessonResponseDTO;
import com.tutoring.lesson.dto.LessonWithTutorDTO;
import com.tutoring.lesson.dto.UserDTO;
import com.tutoring.lesson.model.Lesson;
import com.tutoring.lesson.repository.LessonRepository;

@Service
public class LessonService {
  private final LessonRepository lessonRepository;
  private final LessonMapper lessonMapper;
  private final RestTemplate restTemplate;

  public LessonService(LessonRepository lessonRepository, LessonMapper lessonMapper, RestTemplate restTemplate) {
    this.lessonRepository = lessonRepository;
    this.lessonMapper = lessonMapper;
    this.restTemplate = restTemplate;
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

    System.out.println("Saved lesson: " + savedLesson);
    System.out.println("ID: " + savedLesson.getId());
    System.out.println("Subject: " + savedLesson.getSubject());
    System.out.println("TutorId: " + savedLesson.getTutorId());
    LessonResponseDTO response = new LessonResponseDTO();
    response.setId(savedLesson.getId());
    response.setSubject(savedLesson.getSubject());
    response.setDescription(savedLesson.getDescription());
    response.setDurationTime(savedLesson.getDurationTime());
    response.setTutorId(savedLesson.getTutorId());
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

  public List<LessonWithTutorDTO> getLessonsWithTutors() {
    List<Lesson> lessons = lessonRepository.findAll();

    return lessons.stream()
        .map(lesson -> {
          String url = "http://192.168.1.32:8090/api/users/" + lesson.getTutorId();
          UserDTO tutor = null;
          try {
            tutor = restTemplate.getForObject(url, UserDTO.class);
          } catch (RestClientException e) {

          }
          return new LessonWithTutorDTO(
              lesson.getId(),
              lesson.getSubject(),
              lesson.getDescription(),
              lesson.getDurationTime(),
              tutor);
        })
        .collect(Collectors.toList());
  }
}

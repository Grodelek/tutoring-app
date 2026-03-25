package com.tutoring.app.Lesson;

import com.tutoring.app.domain.User;
import com.tutoring.app.dto.LessonRequestDTO;
import com.tutoring.app.dto.LessonResponseDTO;
import com.tutoring.app.repository.LessonRepository;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.service.LessonService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

import com.tutoring.app.domain.Lesson;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LessonServiceTest {
    @Mock
    LessonRepository lessonRepository;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    LessonService lessonService;


    @Test
    public void shouldCreateLesson() {
        UUID tutorId = UUID.randomUUID();
        User user = new User();
        user.setId(tutorId);
        user.setEmail("abc@example.com");
        user.setUsername("abc");
        user.setPassword("password");

        LessonRequestDTO lessonRequestDTO = LessonRequestDTO.builder()
                .subject("Math")
                .durationTime(60)
                .price(BigDecimal.valueOf(50.00))
                .description("Algebra lesson")
                .build();

        Lesson lesson = new Lesson();
        lesson.setTutor(user);
        lesson.setSubject(lessonRequestDTO.getSubject());
        lesson.setDescription(lessonRequestDTO.getDescription());
        lesson.setDurationTime(lessonRequestDTO.getDurationTime());
        lesson.setPrice(lessonRequestDTO.getPrice());

        when(userRepository.findById(tutorId)).thenReturn(Optional.of(user));
        when(lessonRepository.save(any())).thenReturn(lesson);

        LessonResponseDTO result = lessonService.createLesson(lessonRequestDTO);
        assertAll(
                () ->
                {
                    assertNotNull(result);
                },
                () -> {
                    assertEquals(lessonRequestDTO.getSubject(), result.getSubject());
                    assertEquals(lessonRequestDTO.getDescription(), result.getDescription());
                    assertEquals(lessonRequestDTO.getDurationTime(), result.getDurationTime());
                    assertEquals(lessonRequestDTO.getPrice(), result.getPrice());
                });
    }


    @Test
    public void shouldUpdateLesson(){
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("abc@example.com")
                .username("abc")
                .password("password")
                .build();

        UUID lessonId = UUID.randomUUID();

        Lesson lesson = Lesson.builder()
                .id(lessonId)
                .subject("Math")
                .durationTime(60)
                .price(BigDecimal.valueOf(50.00))
                .description("Algebra lesson")
                .tutor(user)
                .build();

        LessonRequestDTO lessonRequestDTO = LessonRequestDTO.builder()
                .subject("Polish")
                .durationTime(45)
                .price(BigDecimal.valueOf(60.00))
                .description("Polish lesson")
                .build();

        Lesson updatedLesson = Lesson.builder()
                .id(lessonId)
                .subject(lessonRequestDTO.getSubject())
                .durationTime(lessonRequestDTO.getDurationTime())
                .price(lessonRequestDTO.getPrice())
                .description(lessonRequestDTO.getDescription())
                .tutor(user)
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(updatedLesson);

        ResponseEntity<LessonResponseDTO> response = lessonService.updateLesson(lessonId, lessonRequestDTO);
        assertNotNull(response);

        LessonResponseDTO result = response.getBody();
        assertNotNull(result);
    }
}

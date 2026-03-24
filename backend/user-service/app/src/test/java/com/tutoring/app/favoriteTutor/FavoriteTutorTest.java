package com.tutoring.app.favoriteTutor;

import com.tutoring.app.domain.FavoriteTutor;
import com.tutoring.app.dto.FavoriteTutorDTO;
import com.tutoring.app.repository.FavoriteTutorRepository;
import com.tutoring.app.service.FavoriteTutorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.tutoring.app.domain.User;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FavoriteTutorTest {
    @Mock
    FavoriteTutorRepository favoriteTutorRepository;
    @InjectMocks
    FavoriteTutorService favoriteTutorService;

    @Test
    public void shouldAddToFavorite(){
        UUID studentId = UUID.randomUUID();
        UUID tutorId = UUID.randomUUID();

        User tutor = User.builder()
                .id(tutorId)
                .email("tutor@example.com")
                .username("tutor")
                .password("password")
                .build();

        User student = User.builder()
                .id(studentId)
                .email("student@example.com")
                .username("student")
                .password("password")
                .build();

        FavoriteTutor favoriteTutor = FavoriteTutor.builder()
                .id(UUID.randomUUID())
                .student(student)
                .tutor(tutor)
                .build();

        FavoriteTutorDTO favoriteTutorDTO = new FavoriteTutorDTO(favoriteTutor.getId(), studentId, tutorId);

        when(favoriteTutorRepository.save(favoriteTutor)).thenReturn(favoriteTutor);
        when(favoriteTutorService.addFavorite(studentId, tutorId)).thenReturn(favoriteTutorDTO);

        FavoriteTutorDTO result = favoriteTutorService.addFavorite(studentId, tutorId);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals(studentId, result.getStudentId());
        assertEquals(tutorId, result.getTutorId());
    }

}

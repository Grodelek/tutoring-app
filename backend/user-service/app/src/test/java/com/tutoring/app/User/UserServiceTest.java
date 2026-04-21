package com.tutoring.app.User;

import com.tutoring.app.domain.Availability;
import com.tutoring.app.domain.ExperienceTime;
import com.tutoring.app.domain.User;
import com.tutoring.app.domain.UserType;
import com.tutoring.app.dto.TutorInfoDTO;
import com.tutoring.app.dto.TutorInfoResponse;
import com.tutoring.app.dto.UpdateUserProfileRequest;
import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import static com.tutoring.app.domain.Availability.WEEKDAYS_ONLY;
import static com.tutoring.app.domain.ExperienceTime.INTERMEDIATE;
import static com.tutoring.app.domain.LessonType.CASUAL;
import static com.tutoring.app.domain.UserType.STUDENT;
import static com.tutoring.app.domain.UserType.TUTOR;
import static org.mockito.ArgumentMatchers.any;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UserService userService;

    @Test
    void shouldReturnUserWhenUUIDExists(){
        UUID userId = UUID.randomUUID();
        User mockUser = new User(userId, "abc@wp.pl", "Ala");
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        User result = userService.getUserById(userId);
        assertEquals("Ala", result.getUsername());
        verify(userRepository).findById(userId);
    }

    @Test
    void shouldRegisterUser(){
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername("Username");
        userDTO.setEmail("abc@wp.pl");
        userDTO.setPassword("abc123");
        when(userRepository.existsByEmail("abc@wp.pl")).thenReturn(false);
        when(passwordEncoder.encode("abc123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        User registered = userService.register(userDTO);
        assertEquals("Username", registered.getUsername());
        assertEquals("abc@wp.pl", registered.getEmail());
        assertEquals("hashedPassword", registered.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldUpdateUserProfile(){
        UUID userId = UUID.randomUUID();
        User mockUser = new User(userId, "abc@wp.pl", "Ala");
        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setUsername("Ola");
        request.setDescription("New description");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(mockUser)).thenReturn(mockUser);

        User user = userService.updateUserProfile(userId, request);

        assertEquals("Ola", user.getUsername());
        assertEquals("New description", user.getDescription());
        verify(userRepository).save(mockUser);
    }

    @Test
    void shouldAddTutorInfo() throws Exception {
        UUID userId = UUID.randomUUID();
        User mockUser = new User(userId, "abc@wp.pl", "Ala123");
        mockUser.setUserType(TUTOR);
        TutorInfoDTO tutorInfoDTO = new TutorInfoDTO();
        tutorInfoDTO.setAvailability(WEEKDAYS_ONLY);
        tutorInfoDTO.setExperienceTime(INTERMEDIATE);
        tutorInfoDTO.setLessonType(CASUAL);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("Ala123")
                .password("hashedPassword")
                .roles("USER")
                .build();
        when(userRepository.findByUsername("Ala123")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(mockUser)).thenReturn(mockUser);

        TutorInfoResponse tutorInfoResponse = userService.addTutorInfo(tutorInfoDTO, userDetails);
        assertEquals(WEEKDAYS_ONLY, tutorInfoResponse.getAvailability());
        assertEquals(INTERMEDIATE, tutorInfoResponse.getExperienceTime());
        assertEquals(CASUAL, tutorInfoResponse.getLessonType());
        verify(userRepository).save(mockUser);
    }

}

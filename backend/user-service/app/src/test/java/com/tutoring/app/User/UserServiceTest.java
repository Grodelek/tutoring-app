package com.tutoring.app.User;

import com.tutoring.app.domain.User;
import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.mockito.ArgumentMatchers.any;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
}

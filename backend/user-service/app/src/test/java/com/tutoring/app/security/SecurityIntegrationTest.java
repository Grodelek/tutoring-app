package com.tutoring.app.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutoring.app.user.JWTService;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserRepository;
import com.tutoring.app.user.UserType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired JWTService jwtService;

    @AfterEach void cleanDatabase() { userRepository.deleteAll(); }

    @Test
    void registrationAndLoginArePublicButProfileIsProtected() throws Exception {
        Map<String, String> registration = Map.of("username", "student1", "email", "student@example.test", "password", "secret123", "userType", "STUDENT");
        mvc.perform(post("/api/users/add").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/users/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(Map.of("email", "student@example.test", "password", "secret123"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
        User user = userRepository.findByEmail("student@example.test").orElseThrow();
        mvc.perform(get("/api/users/" + user.getId())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/" + user.getId()).header("Authorization", "Bearer malformed.jwt.value"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/" + user.getId()).header("Authorization", "Bearer " + jwtService.generateToken(user.getUsername())))
                .andExpect(status().isOk());
    }

    @Test
    void duplicateEmailIsRejected() throws Exception {
        User existing = User.builder().username("existing").email("duplicate@example.test").password("x").userType(UserType.STUDENT).build();
        userRepository.save(existing);
        mvc.perform(post("/api/users/add").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "newuser", "email", "duplicate@example.test", "password", "secret123", "userType", "STUDENT"))))
                .andExpect(status().isConflict());
    }

    @Test
    void authenticatedNonOwnerCannotModifyAnotherProfile() throws Exception {
        User owner = userRepository.save(User.builder().username("owner").email("owner@example.test")
                .password("encoded").userType(UserType.STUDENT).build());
        User other = userRepository.save(User.builder().username("other").email("other@example.test")
                .password("encoded").userType(UserType.STUDENT).build());

        mvc.perform(put("/api/users/" + owner.getId())
                        .header("Authorization", "Bearer " + jwtService.generateToken(other.getUsername()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "hijacked", "description", "x"))))
                .andExpect(status().isForbidden());
    }
}

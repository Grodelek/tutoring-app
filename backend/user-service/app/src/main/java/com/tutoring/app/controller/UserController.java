package com.tutoring.app.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.tutoring.app.dto.UpdateUserProfileRequest;
import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.dto.UserResponseDTO;
import com.tutoring.app.domain.User;
import com.tutoring.app.domain.UserPrincipal;
import com.tutoring.app.service.UserService;
import jakarta.validation.Valid;

@CrossOrigin(origins = { "http://localhost:8081", "exp://192.168.1.32:8081" })
@RestController
@RequestMapping("/api/users")
public class UserController {
  private UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(@RequestBody UserDTO userDTO) {
    return userService.verify(userDTO);
  }

  @GetMapping("/all")
  public List<User> getUsers() {
    return userService.getUsers();
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getUsers(@PathVariable UUID id) {
    return userService.getUserById(id);
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> updateUsername(@PathVariable UUID id, @Valid @RequestBody UpdateUserProfileRequest request) {
    return userService.updateUserProfile(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<String> delete(@PathVariable UUID id) {
    return userService.delete(id);
  }

  @GetMapping("/me")
  public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserPrincipal userDetails) {
    User user = userService.findByUsername(userDetails.getUsername());
    return ResponseEntity.ok(new UserResponseDTO(user));
  }

  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public User register(@Valid @RequestBody UserDTO userDTO) {
    System.out.println("Email: " + userDTO.getEmail());
    System.out.println("Username: " + userDTO.getUsername());
    return userService.register(userDTO);
  }
}

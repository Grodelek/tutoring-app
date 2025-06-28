package com.tutoring.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.model.User;
import com.tutoring.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JWTService jwtService;
  private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager, JWTService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  public List<User> getUsers() {
    return userRepository.findAll();
  }

  public User register(UserDTO userDTO) {
    if (userRepository.existsByEmail(userDTO.getEmail())) {
      throw new IllegalArgumentException("User already has an account.");
    }
    User user = User.builder()
        .username(userDTO.getUsername())
        .email(userDTO.getEmail())
        .password(bCryptPasswordEncoder.encode(userDTO.getPassword()))
        .roles("ROLE_USER")
        .photoPath(
            "https://ui-avatars.com/api/?name=" + userDTO.getUsername() + "&background=random&bold=true&color=fff")
        .build();
    userRepository.save(user);
    return user;
  }

  public ResponseEntity<String> delete(UUID id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isPresent()) {
      User user = userOptional.get();
      userRepository.delete(user);
      return new ResponseEntity<>("User " + user.getUsername() + " deleted", HttpStatus.OK);
    } else {
      return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }
  }

  @Transactional
  public ResponseEntity<Map<String, Object>> verify(UserDTO userDTO) {
    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(userDTO.getUsername(), userDTO.getPassword()));

      Optional<User> userOptional = userRepository.findByEmail(userDTO.getEmail());
      if (userOptional.isEmpty()) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "User not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
      }

      String token = jwtService.generateToken(userDTO.getUsername());
      User user = userOptional.get();
      UUID id = user.getId();

      Map<String, Object> response = new HashMap<>();
      response.put("token", token);
      response.put("userId", id);

      return ResponseEntity.ok(response);

    } catch (AuthenticationException e) {
      Map<String, Object> errorResponse = new HashMap<>();
      errorResponse.put("error", "Authentication failed");
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    } catch (Exception e) {
      e.printStackTrace();
      Map<String, Object> errorResponse = new HashMap<>();
      errorResponse.put("error", "An error occurred");
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
  }

  public ResponseEntity<?> getUserById(UUID id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    return ResponseEntity.ok(userOptional.get());
  }

  public User findByUsername(String username) {
    return userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("Użytkownik nie znaleziony"));
  }

  public ResponseEntity<?> updateUsername(UUID id, String username) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    User user = userOptional.get();
    user.setUsername(username);
    userRepository.save(user);
    return ResponseEntity.ok("Username updated successfully");
  }
}

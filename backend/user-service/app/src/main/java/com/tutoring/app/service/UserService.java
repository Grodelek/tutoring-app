package com.tutoring.app.service;

import java.io.ObjectInputFilter.Status;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.model.User;
import com.tutoring.app.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public List<User> getUsers() {
    return userRepository.findAll();
  }

  public User register(UserDTO userDTO) {
    User user = User.builder()
        .username(userDTO.getUsername())
        .email(userDTO.getEmail())
        .password(passwordEncoder.encode(userDTO.getPassword()))
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

}

package com.tutoring.app.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.model.User;
import com.tutoring.app.repository.UserRepository;
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

  public UUID register(UserDTO userDTO) {
    User user = User.builder()
        .username(userDTO.getUsername())
        .email(userDTO.getEmail())
        .password(passwordEncoder.encode(userDTO.getPassword()))
        .build();
    userRepository.save(user);
    return user.getId();
  }

}

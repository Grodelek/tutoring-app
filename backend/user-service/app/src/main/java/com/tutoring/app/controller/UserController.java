package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.model.User;
import com.tutoring.app.service.UserService;

@CrossOrigin(origins = { "http://localhost:8081", "exp://192.168.1.32:8081" })
@RestController
@RequestMapping("/api/users")
public class UserController {
  private UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/login")
  public ResponseEntity<String> login(@RequestBody UserDTO userDTO) {
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

  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public User register(@RequestBody UserDTO userDTO) {
    System.out.println("Email: " + userDTO.getEmail());
    System.out.println("Username: " + userDTO.getUsername());
    return userService.register(userDTO);
  }

  @DeleteMapping("/delete/{id}")
  public ResponseEntity<String> delete(@PathVariable UUID id) {
    return userService.delete(id);
  }
}

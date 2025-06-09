package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import com.tutoring.app.dto.UserDTO;
import com.tutoring.app.model.User;
import com.tutoring.app.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/all")
  public List<User> getUsers() {
    return userService.getUsers();
  }

  @PostMapping("/add")
  @ResponseStatus(HttpStatus.CREATED)
  public UUID register(@RequestBody UserDTO userDTO) {
    return userService.register(userDTO);
  }

}

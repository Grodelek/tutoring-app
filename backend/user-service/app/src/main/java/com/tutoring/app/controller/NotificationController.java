package com.tutoring.app.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:19000",
        "exp://192.168.2.167:8081"
})
public class NotificationController {

  @MessageMapping("send-message")
  @SendTo("/topic/notification")
  public String sendMessage(String message) {
    return message;
  }
}

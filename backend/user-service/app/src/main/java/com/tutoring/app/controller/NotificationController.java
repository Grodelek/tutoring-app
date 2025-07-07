package com.tutoring.app.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

  @MessageMapping("send-message")
  @SendTo("/topic/notification")
  public String sendMessage(String message) {
    System.out.println("message: " + message);
    return message;
  }
}

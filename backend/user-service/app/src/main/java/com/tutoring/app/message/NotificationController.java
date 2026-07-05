package com.tutoring.app.message;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Notifications", description = "WebSocket-based real-time notifications")
@RestController
@CrossOrigin(origins = {"http://localhost:8081","http://localhost:19006","http://localhost:19000","exp://192.168.2.167:8081","http://localhost:5173","http://192.168.1.32:5173"})
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
public class NotificationController {
  @MessageMapping("send-message")
  @SendTo("/topic/notification")
  public String sendMessage(String message) { return message; }
}

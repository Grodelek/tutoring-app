package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tutoring.app.model.Conversation;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.UserRepository;

@RestController
@RequestMapping("/api/conversation")
public class ConversationController {
  private final ConversationRepository conversationRepository;
  private final UserRepository userRepository;

  public ConversationController(
      ConversationRepository conversationRepository, UserRepository userRepository) {
    this.conversationRepository = conversationRepository;
    this.userRepository = userRepository;
  }

  @GetMapping("/{userId}")
  public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable UUID userId) {
    List<Conversation> conversations = conversationRepository.findByUser1IdOrUser2Id(userId, userId);
    if (conversations.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
    return ResponseEntity.ok(conversations);
  }
}

package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tutoring.app.model.Conversation;
import com.tutoring.app.model.ConversationHistory;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.service.ConversationHistoryService;
import com.tutoring.app.service.ConversationService;

@RestController
@RequestMapping("/api/conversation-history")
public class ConversationController {
  private final ConversationHistoryService conversationHistoryService;
  private final ConversationRepository conversationRepository;
  private final UserRepository userRepository;

  public ConversationController(ConversationHistoryService conversationHistoryService,
      ConversationRepository conversationRepository, UserRepository userRepository) {
    this.conversationHistoryService = conversationHistoryService;
    this.conversationRepository = conversationRepository;
    this.userRepository = userRepository;
  }

  @PostMapping("/{userId}")
  public ConversationHistory assignConversationsToHistory(@PathVariable UUID userId) {
    return conversationHistoryService.assignConversationsToHistory(userId);
  }

  @GetMapping("/{userId}")
  public ResponseEntity<List<Conversation>> getConversationHistory(@PathVariable UUID userId) {
    List<Conversation> conversations = conversationRepository.findAll().stream()
        .filter(c -> (userId.equals(c.getUser1Id()) || userId.equals(c.getUser2Id())))
        .peek(c -> {
          if (c.getUser1Username() == null || c.getUser2Username() == null) {
            userRepository.findById(c.getUser1Id()).ifPresent(u -> c.setUser1Username(u.getUsername()));
            userRepository.findById(c.getUser2Id()).ifPresent(u -> c.setUser2Username(u.getUsername()));
          }
        })
        .collect(Collectors.toList());

    return ResponseEntity.ok(conversations);
  }
}

package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tutoring.app.dto.ConversationDTO;
import com.tutoring.app.domain.Conversation;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.UserRepository;

@RestController
@CrossOrigin(origins = {
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:19000",
        "exp://192.168.2.167:8081"
})
@RequestMapping("/api/conversation")
public class ConversationController {
  private final ConversationRepository conversationRepository;
  private final UserRepository userRepository;

  public ConversationController(ConversationRepository conversationRepository, UserRepository userRepository) {
    this.conversationRepository = conversationRepository;
    this.userRepository = userRepository;
  }

  @GetMapping("/{userId}")
  public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable UUID userId) {
    List<Conversation> conversations = conversationRepository.findByUser1IdOrUser2Id(userId);
    List<ConversationDTO> conversationDTOs = conversations.stream()
        .map(ConversationDTO::new)
        .collect(Collectors.toList());
    return ResponseEntity.ok(conversationDTOs);
  }
}

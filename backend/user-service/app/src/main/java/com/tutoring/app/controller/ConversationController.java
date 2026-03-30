package com.tutoring.app.controller;

import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tutoring.app.dto.ConversationDTO;
import com.tutoring.app.domain.Conversation;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.repository.ConversationRepository.ConversationLastMessageProjection;

@RestController
@CrossOrigin(origins = {"http://localhost:8081"})
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

    List<ConversationLastMessageProjection> projections = conversationRepository.findLastMessageTimestamps(userId);
    Map<UUID, ConversationLastMessageProjection> lastMessageMap = projections.stream()
            .collect(Collectors.toMap(ConversationLastMessageProjection::getConversationId, Function.identity()));

    List<ConversationDTO> conversationDTOs = conversations.stream()
            .map(conversation -> {
              ConversationDTO dto = new ConversationDTO(conversation);
              ConversationLastMessageProjection proj = lastMessageMap.get(conversation.getId());
              if (proj != null) {
                dto.setLastMessageAt(proj.getLastMessageAt());
              }
              return dto;
            })
            .collect(Collectors.toList());

    return ResponseEntity.ok(conversationDTOs);
  }
}
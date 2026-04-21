package com.tutoring.app.controller;

import com.tutoring.app.domain.Conversation;
import com.tutoring.app.dto.ConversationDTO;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.ConversationRepository.ConversationLastMessageProjection;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:8081"})
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@RequestMapping("/api/conversation")
public class ConversationController {

  private final ConversationRepository conversationRepository;

  public ConversationController(ConversationRepository conversationRepository) {
    this.conversationRepository = conversationRepository;
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
package com.tutoring.app.conversation;

import com.tutoring.app.conversation.ConversationRepository.ConversationLastMessageProjection;
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
    List<ConversationDTO> dtos = conversations.stream().map(c -> {
              ConversationDTO dto = new ConversationDTO(c);
              ConversationLastMessageProjection proj = lastMessageMap.get(c.getId());
              if (proj != null) dto.setLastMessageAt(proj.getLastMessageAt());
              return dto;
            }).collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
  }
}

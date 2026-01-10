package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import com.tutoring.app.dto.ConversationRequest;
import com.tutoring.app.dto.MessageDTO;
import com.tutoring.app.dto.MessageRequest;
import com.tutoring.app.domain.Conversation;
import com.tutoring.app.domain.Message;
import com.tutoring.app.service.ConversationService;
import com.tutoring.app.service.MessageService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:19000",
        "exp://192.168.2.167:8081"
})
@RequiredArgsConstructor
public class MessageController {
  private final MessageService messageService;
  private final ConversationService conversationService;
  private final SimpMessagingTemplate messagingTemplate;

  @PostMapping("/send")
  public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request) throws Exception {
    MessageDTO saved = messageService.sendMessage(
        request.getSenderId(),
        request.getReceiverId(),
        request.getContent());

    messagingTemplate.convertAndSend("/topic/notification", saved);
    return ResponseEntity.ok(saved);
  }

  @GetMapping("/{conversationId}")
  public ResponseEntity<List<MessageDTO>> getMessages(@PathVariable UUID conversationId) {
    List<MessageDTO> dtos = messageService.getMessages(conversationId);
    return ResponseEntity.ok(dtos);
  }

  @PostMapping("/get-or-create")
  public ResponseEntity<?> getOrCreateConversation(@RequestBody ConversationRequest req) {
    try {
      Conversation conversation = messageService.getOrCreateConversation(req.getUser1Id(), req.getUser2Id());
      return ResponseEntity.ok(conversation);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Wystąpił błąd serwera");
    }
  }
}

package com.tutoring.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tutoring.app.dto.ConversationRequest;
import com.tutoring.app.dto.MessageRequest;
import com.tutoring.app.model.Conversation;
import com.tutoring.app.model.Message;
import com.tutoring.app.service.ConversationService;
import com.tutoring.app.service.MessageService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
  private final MessageService messageService;
  private final ConversationService conversationService;

  @PostMapping("/send")
  public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request) {
    messageService.sendMessage(request.getSenderId(), request.getReceiverId(), request.getContent());
    return ResponseEntity.ok("Wiadomość wysłana");
  }

  @GetMapping("/{conversationId}")
  public ResponseEntity<List<Message>> getMessages(@PathVariable UUID conversationId) {
    List<Message> messages = messageService.getMessages(conversationId);
    return ResponseEntity.ok(messages);
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

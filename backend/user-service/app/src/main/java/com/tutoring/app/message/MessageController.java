package com.tutoring.app.message;

import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.conversation.ConversationDTO;
import com.tutoring.app.conversation.ConversationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.tutoring.app.user.UserPrincipal;

@Tag(name = "Messages", description = "Sending and retrieving messages within conversations")
@RestController
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin(origins = {"http://localhost:8081","http://localhost:19006","http://localhost:19000","exp://192.168.2.167:8081","http://localhost:5173","http://192.168.1.32:5173"})
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {
  private final MessageService messageService;
  private final ConversationService conversationService;
  private final SimpMessagingTemplate messagingTemplate;

  @PostMapping("/send")
  public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request) throws Exception {
    MessageDTO saved = messageService.sendMessage(
        request.getReceiverId(),
        request.getContent(), request.getMessageType(), request.getLessonId());
    messagingTemplate.convertAndSendToUser(
        messageService.findUsernameById(saved.getReceiverId()), "/queue/messages", saved);
    return ResponseEntity.ok(saved);
  }

  @GetMapping("/{conversationId}")
  public ResponseEntity<List<MessageDTO>> getMessages(@PathVariable UUID conversationId) {
    return ResponseEntity.ok(messageService.getMessages(conversationId));
  }

  @PostMapping("/get-or-create")
  public ResponseEntity<?> getOrCreateConversation(@RequestBody ConversationDTO req) {
    try {
      UserPrincipal principal = (UserPrincipal) org.springframework.security.core.context.SecurityContextHolder
          .getContext().getAuthentication().getPrincipal();
      UUID authenticatedId = messageService.findUserIdByUsername(principal.getUsername());
      UUID otherUserId = authenticatedId.equals(req.getUser1Id()) ? req.getUser2Id() : req.getUser1Id();
      if (!authenticatedId.equals(req.getUser1Id()) && !authenticatedId.equals(req.getUser2Id())) {
        throw new org.springframework.security.access.AccessDeniedException("Authenticated user must be a participant");
      }
      Conversation conversation = messageService.getOrCreateConversationForUser(authenticatedId, otherUserId);
      return ResponseEntity.ok(conversation);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Wystąpił błąd serwera");
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteMessage(@PathVariable UUID id) {
    try {
      messageService.deleteMessage(id);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
    }
  }
}

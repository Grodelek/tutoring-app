package com.tutoring.app.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tutoring.app.model.ConversationHistory;
import com.tutoring.app.service.ConversationHistoryService;

@RestController
@RequestMapping("/api/conversation-history")
public class ConversationController {
  private final ConversationHistoryService conversationHistoryService;

  public ConversationController(ConversationHistoryService conversationHistoryService) {
    this.conversationHistoryService = conversationHistoryService;
  }

  @PostMapping("/{userId}")
  public ConversationHistory allConversations(@PathVariable UUID userId) {
    return conversationHistoryService.assignConversationsToHistory(userId);
  }
}

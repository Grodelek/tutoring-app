package com.tutoring.app.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tutoring.app.model.Conversation;
import com.tutoring.app.model.ConversationHistory;
import com.tutoring.app.repository.ConversationHistoryRepository;
import com.tutoring.app.repository.ConversationRepository;

@Service
public class ConversationHistoryService {
  private final ConversationHistoryRepository conversationHistoryRepository;
  private final ConversationRepository conversationRepository;

  public ConversationHistoryService(ConversationHistoryRepository conversationHistoryRepository,
      ConversationRepository conversationRepository) {
    this.conversationHistoryRepository = conversationHistoryRepository;
    this.conversationRepository = conversationRepository;
  }

  public ConversationHistory assignConversationsToHistory(UUID userId) {
    List<Conversation> userConverastions = conversationRepository.findAll()
        .stream()
        .filter(c -> userId.equals(c.getUser1Id()) || userId.equals(c.getUser2Id()))
        .collect(Collectors.toList());
    ConversationHistory history = new ConversationHistory();
    history.setUserId(userId);
    history.setConversationList(userConverastions);
    for (Conversation c : userConverastions) {
      c.setConversationHistory(history);
    }
    return conversationHistoryRepository.save(history);
  }
}

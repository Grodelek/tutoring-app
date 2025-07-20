package com.tutoring.app.service;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.tutoring.app.model.Conversation;
import com.tutoring.app.repository.ConversationRepository;

@Service
public class ConversationService {
  private final ConversationRepository conversationRepository;

  public ConversationService(ConversationRepository conversationRepository) {
    this.conversationRepository = conversationRepository;
  }

  public Conversation getOrCreateConversation(UUID userA, UUID userB) {
    Optional<Conversation> conversation = conversationRepository
        .findByUsers(userA, userB);
    if (conversation.isPresent()) {
      return conversation.get();
    } else {
      Conversation newConversation = new Conversation();
      newConversation.setUser1Id(userA);
      newConversation.setUser2Id(userB);
      return conversationRepository.save(newConversation);
    }
  }
}

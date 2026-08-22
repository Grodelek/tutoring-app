package com.tutoring.app.conversation;

import org.springframework.stereotype.Service;

@Service
public class ConversationService {
  private final ConversationRepository conversationRepository;

  public ConversationService(ConversationRepository conversationRepository) {
    this.conversationRepository = conversationRepository;
  }
}

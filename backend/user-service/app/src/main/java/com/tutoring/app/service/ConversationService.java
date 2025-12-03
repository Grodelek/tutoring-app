package com.tutoring.app.service;

import org.springframework.stereotype.Service;
import com.tutoring.app.repository.ConversationRepository;

@Service
public class ConversationService {
  private final ConversationRepository conversationRepository;

  public ConversationService(ConversationRepository conversationRepository) {
    this.conversationRepository = conversationRepository;
  }

}

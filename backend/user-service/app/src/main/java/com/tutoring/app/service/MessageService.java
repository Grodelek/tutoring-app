package com.tutoring.app.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

import com.tutoring.app.model.Conversation;
import com.tutoring.app.model.Message;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.MessageRepository;

@Service
public class MessageService {

  private final MessageRepository messageRepository;
  private final ConversationRepository conversationRepository;

  public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository) {
    this.messageRepository = messageRepository;
    this.conversationRepository = conversationRepository;
  }

  public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
    if (user1Id == null || user2Id == null) {
      throw new IllegalArgumentException("User IDs cannot be null");
    }
    return conversationRepository.findAll().stream()
        .filter(c -> {
          UUID cUser1Id = c.getUser1Id();
          UUID cUser2Id = c.getUser2Id();
          return cUser1Id != null && cUser2Id != null &&
              ((user1Id.equals(cUser1Id) && user2Id.equals(cUser2Id)) ||
                  (user1Id.equals(cUser2Id) && user2Id.equals(cUser1Id)));
        })
        .findFirst()
        .orElseGet(() -> {
          Conversation newConversation = new Conversation();
          newConversation.setUser1Id(user1Id);
          newConversation.setUser2Id(user2Id);
          return conversationRepository.save(newConversation);
        });
  }

  public void sendMessage(UUID senderId, UUID receiverId, String content) {
    Conversation conversation = getOrCreateConversation(senderId, receiverId);
    Message message = new Message();
    message.setSenderId(senderId);
    message.setReceiverId(receiverId);
    message.setContent(content);
    message.setConversation(conversation);
    messageRepository.save(message);
  }

  public List<Message> getMessages(UUID conversationId) {
    return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
  }
}

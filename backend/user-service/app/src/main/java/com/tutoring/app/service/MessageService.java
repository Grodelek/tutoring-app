package com.tutoring.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.tutoring.app.model.Conversation;
import com.tutoring.app.model.Message;
import com.tutoring.app.model.User;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.MessageRepository;
import com.tutoring.app.repository.UserRepository;

@Service
public class MessageService {
  private final MessageRepository messageRepository;
  private final ConversationRepository conversationRepository;
  private final UserRepository userRepository;

  public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository,
      UserRepository userRepository) {
    this.messageRepository = messageRepository;
    this.conversationRepository = conversationRepository;
    this.userRepository = userRepository;
  }

  public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
    Optional<User> userSenderOptional = userRepository.findById(user1Id);
    Optional<User> userReceiverOptional = userRepository.findById(user2Id);

    if (userSenderOptional.isEmpty() || userReceiverOptional.isEmpty()) {
      throw new IllegalArgumentException("User not found");
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
          User userSender = userSenderOptional.get();
          User userReceiver = userReceiverOptional.get();

          newConversation.setUser1Id(user1Id);
          newConversation.setUser2Id(user2Id);
          newConversation.setUser1Username(userSender.getUsername());
          newConversation.setUser2Username(userReceiver.getUsername());

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

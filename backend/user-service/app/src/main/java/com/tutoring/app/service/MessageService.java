package com.tutoring.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tutoring.app.dto.MessageDTO;
import com.tutoring.app.domain.Conversation;
import com.tutoring.app.domain.Message;
import com.tutoring.app.domain.User;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.MessageRepository;
import com.tutoring.app.repository.UserRepository;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final AesUtils aesUtils;

    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository,
                          UserRepository userRepository, AesUtils aesUtils) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.aesUtils = aesUtils;
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

    public MessageDTO sendMessage(UUID senderId, UUID receiverId, String content) throws Exception {
        Conversation conversation = getOrCreateConversation(senderId, receiverId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(aesUtils.encrypt(content));
        message.setConversation(conversation);
        messageRepository.save(message);
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setContent(content);
        messageDTO.setId(message.getId());
        messageDTO.setTimestamp(message.getTimestamp());
        messageDTO.setReceiverId(message.getReceiver().getId());
        messageDTO.setSenderId(message.getSender().getId());
        return messageDTO;
    }

    public List<MessageDTO> getMessages(UUID conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        return messages.stream().map(msg -> {
            String decryptedContent;
            try {
                decryptedContent = aesUtils.decrypt(msg.getContent());
            } catch (Exception e) {
                throw new RuntimeException("Decrypting error: " + msg.getId(), e);
            }
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setContent(decryptedContent);
            messageDTO.setId(msg.getId());
            messageDTO.setTimestamp(msg.getTimestamp());
            messageDTO.setReceiverId(msg.getReceiver().getId());
            messageDTO.setSenderId(msg.getSender().getId());
            return messageDTO;
        }).toList();
    }
}

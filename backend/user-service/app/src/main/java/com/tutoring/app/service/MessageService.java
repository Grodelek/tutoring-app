package com.tutoring.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tutoring.app.dto.MessageDTO;
import com.tutoring.app.domain.Conversation;
import com.tutoring.app.domain.Message;
import com.tutoring.app.domain.User;
import com.tutoring.app.domain.MessageType;
import com.tutoring.app.repository.ConversationRepository;
import com.tutoring.app.repository.MessageRepository;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.repository.LessonRepository;
import com.tutoring.app.domain.Lesson;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final AesUtils aesUtils;

    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository,
                          UserRepository userRepository, LessonRepository lessonRepository, AesUtils aesUtils) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
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
                    UUID cUser1Id = c.getUser1() != null ? c.getUser1().getId() : null;
                    UUID cUser2Id = c.getUser2() != null ? c.getUser2().getId() : null;
                    return cUser1Id != null && cUser2Id != null &&
                            ((user1Id.equals(cUser1Id) && user2Id.equals(cUser2Id)) ||
                                    (user1Id.equals(cUser2Id) && user2Id.equals(cUser1Id)));
                })
                .findFirst()
                .orElseGet(() -> {
                    Conversation newConversation = new Conversation();
                    User userSender = userSenderOptional.get();
                    User userReceiver = userReceiverOptional.get();

                    newConversation.setUser1(userSender);
                    newConversation.setUser2(userReceiver);
                    newConversation.setUser1Username(userSender.getUsername());
                    newConversation.setUser2Username(userReceiver.getUsername());

                    return conversationRepository.save(newConversation);
                });
    }

    public MessageDTO sendMessage(UUID senderId, UUID receiverId, String content, MessageType messageType, UUID lessonId) throws Exception {
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
        message.setMessageType(messageType);
        if (messageType == MessageType.INVITATION && lessonId != null) {
            Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
            message.setLesson(lesson);
        }
        messageRepository.save(message);
        return new MessageDTO(message);
    }

    public List<MessageDTO> getMessages(UUID conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        return messages.stream().map(msg -> {
            String decryptedContent;
            try {
                String content = msg.getContent();
                if (content == null || content.isEmpty()) {
                    decryptedContent = "[Empty message]";
                } else {
                    decryptedContent = aesUtils.decrypt(content);
                }
            } catch (Exception e) {
                decryptedContent = "[Message could not be decrypted - possibly encrypted with different key]";
            }
            MessageDTO messageDTO = new MessageDTO(msg);
            messageDTO.setContent(decryptedContent);
            return messageDTO;
        }).toList();
    }

    public void deleteMessage(UUID id) {
        if (!messageRepository.existsById(id)) {
            throw new IllegalArgumentException("Message not found");
        }
        messageRepository.deleteById(id);
    }
}

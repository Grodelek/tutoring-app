package com.tutoring.app.message;

import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.conversation.ConversationRepository;
import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.lesson.LessonRepository;
import com.tutoring.app.offer.TutorOffer;
import com.tutoring.app.user.AesUtils;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        if (userSenderOptional.isEmpty() || userReceiverOptional.isEmpty())
            throw new IllegalArgumentException("User not found");

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
                    Conversation conv = new Conversation();
                    User sender = userSenderOptional.get();
                    User receiver = userReceiverOptional.get();
                    conv.setUser1(sender); conv.setUser2(receiver);
                    conv.setUser1Username(sender.getUsername()); conv.setUser2Username(receiver.getUsername());
                    return conversationRepository.save(conv);
                });
    }

    public MessageDTO sendMessage(UUID senderId, UUID receiverId, String content, MessageType messageType, UUID lessonId) throws Exception {
        Conversation conversation = getOrCreateConversation(senderId, receiverId);
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Message message = new Message();
        message.setSender(sender); message.setReceiver(receiver);
        message.setContent(aesUtils.encrypt(content));
        message.setConversation(conversation); message.setMessageType(messageType);
        if (lessonId != null) {
            Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
            message.setLesson(lesson);
        }
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        messageRepository.save(message);
        MessageDTO dto = new MessageDTO();
        dto.setContent(content); dto.setId(message.getId()); dto.setTimestamp(message.getTimestamp());
        dto.setReceiverId(message.getReceiver().getId()); dto.setSenderId(message.getSender().getId());
        dto.setMessageType(message.getMessageType());
        return dto;
    }

    public MessageDTO sendOfferInvitation(UUID senderId, UUID receiverId, TutorOffer offer) throws Exception {
        Conversation conversation = getOrCreateConversation(senderId, receiverId);
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Message message = new Message();
        message.setSender(sender); message.setReceiver(receiver);
        message.setContent(aesUtils.encrypt("Propozycja sesji"));
        message.setConversation(conversation); message.setMessageType(MessageType.INVITATION);
        message.setLesson(offer.getLesson()); message.setOffer(offer);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        messageRepository.save(message);
        MessageDTO dto = new MessageDTO(message);
        dto.setContent("Propozycja sesji");
        return dto;
    }

    public List<MessageDTO> getMessages(UUID conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream().map(msg -> {
            String decrypted;
            try {
                String content = msg.getContent();
                decrypted = (content == null || content.isEmpty()) ? "[Empty message]" : aesUtils.decrypt(content);
            } catch (Exception e) {
                decrypted = "[Message could not be decrypted - possibly encrypted with different key]";
            }
            MessageDTO dto = new MessageDTO(msg);
            dto.setContent(decrypted);
            return dto;
        }).toList();
    }

    public ResponseEntity<String> deleteMessage(UUID id) {
        Optional<Message> optional = messageRepository.findById(id);
        if (optional.isEmpty()) return new ResponseEntity<>("Message not found", HttpStatus.NOT_FOUND);
        messageRepository.delete(optional.get());
        return new ResponseEntity<>("Message deleted", HttpStatus.OK);
    }
}

package com.tutoring.app.message;

import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.config.BadRequestException;
import com.tutoring.app.conversation.ConversationRepository;
import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.lesson.LessonRepository;
import com.tutoring.app.offer.TutorOffer;
import com.tutoring.app.user.AesUtils;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserRepository;
import com.tutoring.app.user.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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

    public Conversation getOrCreateConversationForUser(UUID authenticatedUserId, UUID otherUserId) {
        if (authenticatedUserId == null || otherUserId == null || authenticatedUserId.equals(otherUserId)) {
            throw new SecurityException("A conversation requires two different participants");
        }
        userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
        userRepository.findById(otherUserId)
                .orElseThrow(() -> new EntityNotFoundException("Receiver not found"));
        return getOrCreateConversation(authenticatedUserId, otherUserId);
    }

    public UUID findUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found")).getId();
    }

    public String findUsernameById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found")).getUsername();
    }

    public MessageDTO sendMessage(UUID receiverId, String content, MessageType messageType, UUID lessonId) throws Exception {
        User sender = getAuthenticatedUser();
        if (receiverId == null || sender.getId().equals(receiverId)) {
            throw new BadRequestException("A valid, different receiver is required");
        }
        Conversation conversation = getOrCreateConversationForUser(sender.getId(), receiverId);
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new EntityNotFoundException("Receiver not found"));
        Message message = new Message();
        message.setSender(sender); message.setReceiver(receiver);
        message.setContent(aesUtils.encrypt(content));
        message.setConversation(conversation); message.setMessageType(messageType);
        if (lessonId != null) {
            Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new EntityNotFoundException("Lesson not found"));
            message.setLesson(lesson);
        }
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        messageRepository.save(message);
        MessageDTO dto = new MessageDTO();
        dto.setContent(content); dto.setId(message.getId()); dto.setTimestamp(message.getTimestamp());
        dto.setReceiverId(message.getReceiver().getId()); dto.setSenderId(message.getSender().getId());
        dto.setConversationId(conversation.getId());
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
        User user = getAuthenticatedUser();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        if (!isParticipant(conversation, user.getId())) {
            throw new SecurityException("You are not a participant of this conversation");
        }
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
        User user = getAuthenticatedUser();
        if (optional.get().getSender() == null || !user.getId().equals(optional.get().getSender().getId())) {
            throw new SecurityException("Only the message author can delete it");
        }
        messageRepository.delete(optional.get());
        return new ResponseEntity<>("Message deleted", HttpStatus.OK);
    }

    private boolean isParticipant(Conversation conversation, UUID userId) {
        return (conversation.getUser1() != null && userId.equals(conversation.getUser1().getId()))
                || (conversation.getUser2() != null && userId.equals(conversation.getUser2().getId()));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new SecurityException("User is not authenticated");
        }
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}

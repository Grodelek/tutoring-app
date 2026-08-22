package com.tutoring.app.message;

import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.conversation.ConversationRepository;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserRepository;
import com.tutoring.app.user.UserPrincipal;
import com.tutoring.app.user.AesUtils;
import com.tutoring.app.lesson.LessonRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.BeforeEach;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    ConversationRepository conversationRepository;
    @Mock MessageRepository messageRepository;
    @Mock LessonRepository lessonRepository;
    @Mock AesUtils aesUtils;

    @InjectMocks
    MessageService messageService;

    private UUID user1Id, user2Id;
    private User user1, user2;

    @BeforeEach
    void setUp() {
        user1Id = UUID.randomUUID();
        user2Id = UUID.randomUUID();
        user1 = User.builder().id(user1Id).username("user1").build();
        user2 = User.builder().id(user2Id).username("user2").build();
    }

    @org.junit.jupiter.api.AfterEach
    void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test
    void shouldThrowWhenUserNotFound() {
        when(userRepository.findById(user1Id)).thenReturn(Optional.empty());
        when(userRepository.findById(user2Id)).thenReturn(Optional.of(user2));

        assertThrows(IllegalArgumentException.class,
                () -> messageService.getOrCreateConversation(user1Id, user2Id));
    }

    @Test
    void shouldReturnExistingConversation() {
        Conversation existing = new Conversation();
        existing.setUser1(user1);
        existing.setUser2(user2);

        when(userRepository.findById(user1Id)).thenReturn(Optional.of(user1));
        when(userRepository.findById(user2Id)).thenReturn(Optional.of(user2));
        when(conversationRepository.findAll()).thenReturn(List.of(existing));

        Conversation result = messageService.getOrCreateConversation(user1Id, user2Id);

        assertSame(existing, result);
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void shouldReturnExistingConversationOtherWayAround() {
        Conversation existing = new Conversation();
        existing.setUser1(user1);
        existing.setUser2(user2);

        when(userRepository.findById(user1Id)).thenReturn(Optional.of(user1));
        when(userRepository.findById(user2Id)).thenReturn(Optional.of(user2));
        when(conversationRepository.findAll()).thenReturn(List.of(existing));

        Conversation result = messageService.getOrCreateConversation(user2Id, user1Id);

        assertSame(existing, result);
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void shouldCreateNewConversationWhenNoneExists() {
        Conversation saved = new Conversation();
        saved.setUser1(user1);
        saved.setUser2(user2);

        when(userRepository.findById(user1Id)).thenReturn(Optional.of(user1));
        when(userRepository.findById(user2Id)).thenReturn(Optional.of(user2));
        when(conversationRepository.findAll()).thenReturn(List.of());
        when(conversationRepository.save(any())).thenReturn(saved);

        Conversation result = messageService.getOrCreateConversation(user1Id, user2Id);

        assertNotNull(result);
        assertEquals(user1, result.getUser1());
        assertEquals(user2, result.getUser2());
        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    void senderIsTakenFromAuthenticationAndConversationIdIsMapped() throws Exception {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID());
        conversation.setUser1(user1);
        conversation.setUser2(user2);
        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user1));
        when(userRepository.findById(user1Id)).thenReturn(Optional.of(user1));
        when(userRepository.findById(user2Id)).thenReturn(Optional.of(user2));
        when(conversationRepository.findAll()).thenReturn(List.of(conversation));
        when(aesUtils.encrypt("hello")).thenReturn("encrypted");
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new UserPrincipal(user1), null, List.of()));

        MessageDTO result = messageService.sendMessage(user2Id, "hello", MessageType.TEXT, null);

        assertEquals(user1Id, result.getSenderId());
        assertEquals(user2Id, result.getReceiverId());
        assertEquals(conversation.getId(), result.getConversationId());
    }

    @Test
    void foreignUserCannotReadConversationHistory() {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID());
        conversation.setUser1(user1);
        conversation.setUser2(user2);
        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user1));
        when(conversationRepository.findById(conversation.getId())).thenReturn(Optional.of(conversation));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new UserPrincipal(user1), null, List.of()));
        // user1 is a participant; changing the stored participants makes the access check observable.
        conversation.setUser1(User.builder().id(UUID.randomUUID()).username("foreign").build());
        assertThrows(SecurityException.class, () -> messageService.getMessages(conversation.getId()));
    }
}

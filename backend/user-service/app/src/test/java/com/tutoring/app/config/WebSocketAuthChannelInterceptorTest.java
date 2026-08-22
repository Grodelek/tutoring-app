package com.tutoring.app.config;

import com.tutoring.app.user.JWTService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketAuthChannelInterceptorTest {
    @Mock JWTService jwtService;
    @Mock UserDetailsService userDetailsService;
    @InjectMocks WebSocketAuthChannelInterceptor interceptor;

    @Test
    void connectWithoutTokenIsRejected() {
        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(frame(StompCommand.CONNECT, null), null));
    }

    @Test
    void connectWithInvalidTokenIsRejected() {
        when(jwtService.extractUserName("broken")).thenThrow(new IllegalArgumentException("bad JWT"));
        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(frame(StompCommand.CONNECT, "Bearer broken"), null));
    }

    @Test
    void connectWithValidTokenSetsPrincipal() {
        UserDetails details = User.withUsername("alice").password("irrelevant").authorities("ROLE_USER").build();
        when(jwtService.extractUserName("valid")).thenReturn("alice");
        when(userDetailsService.loadUserByUsername("alice")).thenReturn(details);
        when(jwtService.validateToken("valid", details)).thenReturn(true);

        Message<?> result = interceptor.preSend(frame(StompCommand.CONNECT, "Bearer valid"), null);
        assertNotNull(StompHeaderAccessor.wrap(result).getUser());
        assertEquals("alice", StompHeaderAccessor.wrap(result).getUser().getName());
    }

    @Test
    void subscribeWithoutAuthenticatedPrincipalIsRejected() {
        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, null), null));
    }

    private Message<byte[]> frame(StompCommand command, String authorization) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
        if (authorization != null) accessor.addNativeHeader("Authorization", authorization);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}

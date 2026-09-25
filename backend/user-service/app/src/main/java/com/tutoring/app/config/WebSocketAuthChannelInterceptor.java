package com.tutoring.app.config;

import com.tutoring.app.user.JWTService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

/** Authenticates STOMP CONNECT frames and rejects anonymous subscriptions. */
@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {
    private final JWTService jwtService;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthChannelInterceptor(JWTService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String header = accessor.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ") || header.length() == 7) {
                throw new MessageDeliveryException("WebSocket authentication required");
            }
            try {
                String token = header.substring(7);
                String username = jwtService.extractUserName(token);
                UserDetails details = userDetailsService.loadUserByUsername(username);
                if (!jwtService.validateToken(token, details)) {
                    throw new MessageDeliveryException("Invalid WebSocket token");
                }
                accessor.setUser(new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
                return org.springframework.messaging.support.MessageBuilder
                        .createMessage(message.getPayload(), accessor.getMessageHeaders());
            } catch (MessageDeliveryException exception) {
                throw exception;
            } catch (Exception exception) {
                throw new MessageDeliveryException(message, exception);
            }
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) && accessor.getUser() == null) {
            throw new MessageDeliveryException("WebSocket authentication required");
        }
        return message;
    }
}

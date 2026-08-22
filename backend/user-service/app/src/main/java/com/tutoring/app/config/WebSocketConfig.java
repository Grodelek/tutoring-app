package com.tutoring.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.tutoring.app.user.JWTService;
import java.security.Principal;
import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  private final JWTService jwtService;
  private final UserDetailsService userDetailsService;
  private final String[] allowedOrigins;

  public WebSocketConfig(JWTService jwtService, UserDetailsService userDetailsService,
                         @Value("${app.websocket.allowed-origins:http://localhost:8081,http://localhost:19006,http://localhost:5173}") String origins) {
    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
    this.allowedOrigins = Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isBlank()).toArray(String[]::new);
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic", "/queue");
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");

  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry config) {
    config.addEndpoint("/ws")
        .setAllowedOrigins(allowedOrigins)
        .withSockJS();

  }

  @Override
  public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
      @Override
      public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
          String header = accessor.getFirstNativeHeader("Authorization");
          if (header == null || !header.startsWith("Bearer ")) {
            throw new org.springframework.messaging.MessageDeliveryException("WebSocket authentication required");
          }
          String token = header.substring(7);
          String username = jwtService.extractUserName(token);
          UserDetails details = userDetailsService.loadUserByUsername(username);
          if (!jwtService.validateToken(token, details)) {
            throw new org.springframework.messaging.MessageDeliveryException("Invalid WebSocket token");
          }
          accessor.setUser(new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) && accessor.getUser() == null) {
          throw new org.springframework.messaging.MessageDeliveryException("WebSocket authentication required");
        }
        return message;
      }
    });
  }
}

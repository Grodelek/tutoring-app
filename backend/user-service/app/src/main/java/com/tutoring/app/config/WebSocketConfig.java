package com.tutoring.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;
import java.security.Principal;
import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  private final WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor;
  private final String[] allowedOrigins;

  public WebSocketConfig(WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor,
                         @Value("${app.websocket.allowed-origins:http://localhost:8081,http://localhost:19006,http://localhost:5173}") String origins) {
    this.webSocketAuthChannelInterceptor = webSocketAuthChannelInterceptor;
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
    registration.interceptors(webSocketAuthChannelInterceptor);
  }
}

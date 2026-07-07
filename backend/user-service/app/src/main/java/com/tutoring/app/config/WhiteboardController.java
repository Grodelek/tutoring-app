package com.tutoring.app.config;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WhiteboardController {

    @MessageMapping("/whiteboard/{conversationId}")
    @SendTo("/topic/whiteboard/{conversationId}")
    public String relay(@DestinationVariable String conversationId, String payload) {
        return payload;
    }
}

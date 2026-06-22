package com.tutoring.app.message;

import lombok.Data;
import java.util.UUID;

@Data
public class MessageRequest {
    private UUID senderId;
    private UUID receiverId;
    private String content;
    private MessageType messageType = MessageType.TEXT;
    private UUID lessonId;
}

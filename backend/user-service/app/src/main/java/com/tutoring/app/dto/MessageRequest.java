package com.tutoring.app.dto;

import java.util.UUID;
import com.tutoring.app.domain.MessageType;
import lombok.Data;


@Data
public class MessageRequest {
  private UUID senderId;
  private UUID receiverId;
  private String content;
  private MessageType messageType = MessageType.TEXT;
  private UUID lessonId;
}


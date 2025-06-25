package com.tutoring.app.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class MessageRequest {
  private UUID senderId;
  private UUID receiverId;
  private String content;
}

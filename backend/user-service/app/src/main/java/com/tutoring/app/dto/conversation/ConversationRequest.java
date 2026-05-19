package com.tutoring.app.dto.conversation;

import java.util.UUID;
import lombok.Data;

@Data
public class ConversationRequest {
  private UUID user1Id;
  private UUID user2Id;
}

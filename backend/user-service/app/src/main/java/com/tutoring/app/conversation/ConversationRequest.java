package com.tutoring.app.conversation;

import lombok.Data;
import java.util.UUID;

@Data
public class ConversationRequest {
  private UUID user1Id;
  private UUID user2Id;
}

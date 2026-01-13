package com.tutoring.app.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.tutoring.app.domain.Conversation;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private UUID id;
    private UUID user1Id;
    private UUID user2Id;
    private String user1Username;
    private String user2Username;

    public ConversationDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.user1Id = conversation.getUser1() != null ? conversation.getUser1().getId() : null;
        this.user2Id = conversation.getUser2() != null ? conversation.getUser2().getId() : null;
        this.user1Username = conversation.getUser1Username();
        this.user2Username = conversation.getUser2Username();
    }
}


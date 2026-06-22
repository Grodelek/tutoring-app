package com.tutoring.app.conversation;

import com.tutoring.app.message.Message;
import com.tutoring.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity @Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Conversation {
  @Id @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;
  @ManyToOne(optional = false) private User user1;
  @ManyToOne(optional = false) private User user2;
  private String user1Username;
  private String user2Username;
  @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
  private List<Message> messages;
  private LocalDateTime lastMessageAt;
}

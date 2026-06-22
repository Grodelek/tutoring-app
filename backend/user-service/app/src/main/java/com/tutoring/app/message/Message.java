package com.tutoring.app.message;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.offer.TutorOffer;
import com.tutoring.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Message {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;
  @ManyToOne
  private User sender;
  @ManyToOne
  private User receiver;
  private String content;
  private LocalDateTime timestamp = LocalDateTime.now();
  @ManyToOne
  @JoinColumn(name = "conversation_id")
  @JsonBackReference
  private Conversation conversation;
  private MessageType messageType = MessageType.TEXT;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lesson_id")
  private Lesson lesson;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "offer_id")
  private TutorOffer offer;
}

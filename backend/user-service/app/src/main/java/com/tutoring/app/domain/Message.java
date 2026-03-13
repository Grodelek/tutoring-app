package com.tutoring.app.domain;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}

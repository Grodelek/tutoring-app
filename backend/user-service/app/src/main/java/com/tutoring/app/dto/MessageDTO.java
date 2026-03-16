package com.tutoring.app.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.tutoring.app.domain.Message;
import com.tutoring.app.domain.MessageType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
  private UUID id;
  private UUID senderId;
  private UUID receiverId;
  private String content;
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime timestamp;
  private UUID conversationId;
  private MessageType messageType;
  private UUID lessonId;
  private LessonResponseDTO lesson;

  public MessageDTO(Message message) {
    this.id = message.getId();
    this.senderId = message.getSender().getId();
    this.receiverId = message.getReceiver().getId();
    this.content = message.getContent();
    this.timestamp = message.getTimestamp();
    this.conversationId = message.getConversation().getId();
    this.messageType = message.getMessageType();
    if (message.getLesson() != null) {
      this.lessonId = message.getLesson().getId();
      this.lesson = new LessonResponseDTO();
      this.lesson.setId(message.getLesson().getId());
      this.lesson.setSubject(message.getLesson().getSubject());
      this.lesson.setDescription(message.getLesson().getDescription());
      this.lesson.setDurationTime(message.getLesson().getDurationTime());
      this.lesson.setTutorId(message.getLesson().getTutor().getId());
    }
  }
}

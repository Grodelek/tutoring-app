package com.tutoring.app.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.tutoring.app.model.Message;

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

  public MessageDTO(Message message) {
    this.id = message.getId();
    this.senderId = message.getSender().getId();
    this.receiverId = message.getReceiver().getId();
    this.content = message.getContent();
    this.timestamp = message.getTimestamp();
  }
}

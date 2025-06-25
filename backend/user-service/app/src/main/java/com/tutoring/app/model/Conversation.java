package com.tutoring.app.model;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Conversation {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;
  private UUID user1Id;
  private UUID user2Id;

  @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
  private List<Message> messages;
}

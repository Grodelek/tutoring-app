package com.tutoring.app.domain;

import java.util.List;
import java.util.UUID;

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
public class Conversation {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;
  @ManyToOne(optional = false)
  private User user1;
  @ManyToOne(optional = false)
  private User user2;
  private String user1Username;
  private String user2Username;

  @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
  private List<Message> messages;

}

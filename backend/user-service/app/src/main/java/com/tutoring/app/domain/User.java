package com.tutoring.app.domain;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "email", unique = true, nullable = false)
  private String email;

  @Column(name = "password", nullable = false)
  @JsonIgnore
  private String password;

  @ElementCollection(fetch = FetchType.EAGER)
  private Set<String> roles = new HashSet<>();

  @Column(name = "username", unique = true, nullable = false)
  private String username;

  @Column(name = "is_confirmed")
  private boolean isConfirmed;

  @Column(name = "photo_path")
  private String photoPath;

  @Column(name = "description")
  private String description;

  @Builder.Default
  @Column(nullable = false)
  private Integer points = 0;

  @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
  @JsonIgnore
  private List<Lesson> lessons = new ArrayList<>();

  public User(UUID id, String email, String username) {
    this.id = id;
    this.email = email;
    this.username = username;
  }
}

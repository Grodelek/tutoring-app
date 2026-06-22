package com.tutoring.app.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tutoring.app.lesson.Lesson;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

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

  @Column(name = "username", unique = true, nullable = false)
  private String username;

  @Column(name = "password", nullable = false)
  @JsonIgnore
  private String password;

  @ElementCollection(fetch = FetchType.EAGER)
  private Set<String> roles = new HashSet<>();

  @Column(name = "is_confirmed")
  private boolean isConfirmed;

  @Column(name = "photo_path")
  private String photoPath;

  @Column(name = "description")
  private String description;

  @Builder.Default
  @Column(nullable = false)
  private Integer points = 0;

  @Builder.Default
  @Column(nullable = false, columnDefinition = "integer default 0")
  private Integer streak = 0;

  @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
  @JsonIgnore
  private List<Lesson> lessons = new ArrayList<>();

  @Enumerated(EnumType.STRING)
  @Column(name = "user_type", nullable = false)
  private UserType userType;

  @Enumerated(EnumType.STRING)
  private ExperienceTime experienceTime;

  @Enumerated(EnumType.STRING)
  private Availability availability;

  @Enumerated(EnumType.STRING)
  private LessonType lessonType;

  public User(UUID id, String email, String username) {
    this.id = id;
    this.email = email;
    this.username = username;
  }
}

package com.tutoring.app.favorite;

import com.tutoring.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "favorite_tutor", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id","tutor_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FavoriteTutor {
  @Id @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false)
  private User student;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "tutor_id", nullable = false)
  private User tutor;
}

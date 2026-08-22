package com.tutoring.app.session;

import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.offer.TutorOffer;
import com.tutoring.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TutoringSession {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(optional = false) private User student;
    @ManyToOne(optional = false) private User tutor;
    @ManyToOne(optional = false) private Lesson lesson;
    @OneToOne(optional = false) private TutorOffer offer;
    @Column(nullable = false) private LocalDateTime startTime;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    @Builder.Default private SessionStatus status = SessionStatus.SCHEDULED;
}

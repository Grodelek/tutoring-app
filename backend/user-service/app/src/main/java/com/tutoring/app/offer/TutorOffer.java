package com.tutoring.app.offer;

import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne(optional = false)
    private User tutor;
    @ManyToOne(optional = false)
    private User student;
    @ManyToOne(optional = false)
    private Lesson lesson;
    private LocalDateTime sessionStartTime;
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean accepted = false;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'PENDING'")
    @Builder.Default
    private OfferStatus status = OfferStatus.PENDING;
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean studentConfirmedPayment = false;
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean tutorConfirmedPayment = false;
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean completed = false;
}

package com.tutoring.app.offer;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class TutorOfferDTO {
    private UUID lessonId;
    private UUID receiverId;
    private LocalDateTime sessionStartTime;
}

package com.tutoring.app.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class TutorOfferDTO {
    private UUID lessonId;
    private UUID receiverId;
    private LocalDateTime sessionStartTime;
}

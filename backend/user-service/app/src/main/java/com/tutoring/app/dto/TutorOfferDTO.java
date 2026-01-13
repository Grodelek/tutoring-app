package com.tutoring.app.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class TutorOfferDTO {
    private UUID tutorId;
    private UUID studentId;
    private UUID lessonId;
}

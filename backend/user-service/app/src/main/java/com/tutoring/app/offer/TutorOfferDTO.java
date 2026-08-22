package com.tutoring.app.offer;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class TutorOfferDTO {
    @Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa6", description = "ID of the lesson being offered")
    private UUID lessonId;
    @Schema(example = "3fa85f64-5717-4562-b3fc-2c963f66afa7", description = "ID of the student receiving the offer")
    private UUID receiverId;
    @Schema(example = "2026-08-01T10:00:00", description = "Proposed session start time (ISO 8601)")
    private LocalDateTime sessionStartTime;
}

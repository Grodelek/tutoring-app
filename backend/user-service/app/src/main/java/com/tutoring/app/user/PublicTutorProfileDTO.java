package com.tutoring.app.user;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicTutorProfileDTO {
    private UUID id;
    private String username;
    private String slug;
    private String photoPath;
    private String description;
    private Integer points;
    private UserType userType;
    private ExperienceTime experienceTime;
    private Availability availability;
    private LessonType lessonType;
    private List<PublicLessonDTO> lessons;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicLessonDTO {
        private UUID id;
        private String subject;
        private int durationTime;
        private BigDecimal price;
        private String description;
    }
}

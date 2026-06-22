package com.tutoring.app.user;

import lombok.*;

@Getter @Setter @Builder
public class TutorInfoResponse {
    Availability availability;
    ExperienceTime experienceTime;
    LessonType lessonType;
}

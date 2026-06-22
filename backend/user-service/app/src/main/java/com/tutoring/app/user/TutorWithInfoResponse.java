package com.tutoring.app.user;

import lombok.*;

@Getter
@Setter
@Builder
public class TutorWithInfoResponse {
    String username;
    ExperienceTime experienceTime;
    Availability availability;
    LessonType lessonType;
}

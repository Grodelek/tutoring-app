package com.tutoring.app.dto;

import com.tutoring.app.domain.Availability;
import com.tutoring.app.domain.ExperienceTime;
import com.tutoring.app.domain.LessonType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TutorInfoResponse {
    Availability availability;
    ExperienceTime experienceTime;
    LessonType lessonType;
}

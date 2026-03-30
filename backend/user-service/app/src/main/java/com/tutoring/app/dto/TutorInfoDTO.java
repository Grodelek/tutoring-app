package com.tutoring.app.dto;

import com.tutoring.app.domain.Availability;
import com.tutoring.app.domain.ExperienceTime;
import com.tutoring.app.domain.LessonType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TutorInfoDTO {
    Availability availability;
    ExperienceTime experienceTime;
    LessonType lessonType;
}

package com.tutoring.app.offer;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tutoring.app.lesson.LessonResponseDTO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor
public class OfferResponseDTO {
  private UUID id;
  private String status;
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime sessionStartTime;
  private boolean studentConfirmedPayment;
  private boolean tutorConfirmedPayment;
  private boolean completed;
  private UUID tutorId;
  private String tutorUsername;
  private String tutorPhotoPath;
  private UUID studentId;
  private String studentUsername;
  private String studentPhotoPath;
  private LessonResponseDTO lesson;

  public OfferResponseDTO(TutorOffer offer) {
    this.id = offer.getId();
    this.status = offer.getStatus() != null ? offer.getStatus().name() : "PENDING";
    this.sessionStartTime = offer.getSessionStartTime();
    this.studentConfirmedPayment = offer.isStudentConfirmedPayment();
    this.tutorConfirmedPayment = offer.isTutorConfirmedPayment();
    this.completed = offer.isCompleted();
    if (offer.getTutor() != null) {
      this.tutorId = offer.getTutor().getId();
      this.tutorUsername = offer.getTutor().getUsername();
      this.tutorPhotoPath = offer.getTutor().getPhotoPath();
    }
    if (offer.getStudent() != null) {
      this.studentId = offer.getStudent().getId();
      this.studentUsername = offer.getStudent().getUsername();
      this.studentPhotoPath = offer.getStudent().getPhotoPath();
    }
    if (offer.getLesson() != null) {
      LessonResponseDTO l = new LessonResponseDTO();
      l.setId(offer.getLesson().getId()); l.setSubject(offer.getLesson().getSubject());
      l.setDescription(offer.getLesson().getDescription()); l.setDurationTime(offer.getLesson().getDurationTime());
      l.setPrice(offer.getLesson().getPrice());
      if (offer.getLesson().getTutor() != null) l.setTutorId(offer.getLesson().getTutor().getId());
      this.lesson = l;
    }
  }
}

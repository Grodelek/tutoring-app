package com.tutoring.app.service;

import com.tutoring.app.domain.Lesson;
import com.tutoring.app.domain.TutorOffer;
import com.tutoring.app.domain.User;
import com.tutoring.app.dto.TutorOfferDTO;
import com.tutoring.app.repository.LessonRepository;
import com.tutoring.app.repository.TutorOfferRepository;
import com.tutoring.app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TutorOfferService {

    private final UserRepository userRepository;
    private final TutorOfferRepository tutorOfferRepository;
    private final LessonRepository lessonRepository;

    public TutorOfferService(UserRepository userRepository, TutorOfferRepository tutorOfferRepository, LessonRepository lessonRepository) {
        this.userRepository = userRepository;
        this.tutorOfferRepository = tutorOfferRepository;
        this.lessonRepository = lessonRepository;
    }


    public TutorOffer makeOffer(TutorOfferDTO offerDTO) {
        if (offerDTO.getTutorId() == null) {
            throw new IllegalArgumentException("Tutor ID cannot be null");
        }
        if (offerDTO.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID cannot be null");
        }
        if (offerDTO.getLessonId() == null) {
            throw new IllegalArgumentException("Lesson ID cannot be null");
        }
        
        User tutor = userRepository.findById(offerDTO.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        User student = userRepository.findById(offerDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Lesson lesson = lessonRepository.findById(offerDTO.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        TutorOffer tutorOffer = TutorOffer.builder().tutor(tutor).student(student).lesson(lesson).build();
        tutorOfferRepository.save(tutorOffer);
        return tutorOffer;
    }

    public TutorOffer acceptOffer(UUID uuid){
        TutorOffer offer = tutorOfferRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
        offer.setAccepted(true);
        offer.setSessionStartTime(LocalDateTime.now());
        tutorOfferRepository.save(offer);
        return offer;
    }
}

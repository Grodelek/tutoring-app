package com.tutoring.app.service;

import com.tutoring.app.domain.Subject;
import com.tutoring.app.domain.TutorOffer;
import com.tutoring.app.domain.User;
import com.tutoring.app.dto.TutorOfferDTO;
import com.tutoring.app.repository.SubjectRepository;
import com.tutoring.app.repository.TutorOfferRepository;
import com.tutoring.app.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class TutorOfferService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final TutorOfferRepository tutorOfferRepository;

    public TutorOfferService(SubjectRepository subjectRepository, UserRepository userRepository, TutorOfferRepository tutorOfferRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.tutorOfferRepository = tutorOfferRepository;
    }


    public TutorOffer makeOffer(TutorOfferDTO offerDTO) {
        Subject subject = subjectRepository.findById(offerDTO.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        User tutor = userRepository.findById(offerDTO.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        TutorOffer offer = TutorOffer.builder()
                .subject(subject)
                .city(offerDTO.getCity())
                .pricePerHour(offerDTO.getPricePerHour())
                .tutor(tutor)
                .level(offerDTO.getLevel())
                .rating(offerDTO.getRating())
                .online(offerDTO.isOnline())
                .lessonsCount(0)
                .build();
        tutorOfferRepository.save(offer);
        return offer;
    }
}

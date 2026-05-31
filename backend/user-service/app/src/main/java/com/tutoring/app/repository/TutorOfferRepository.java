package com.tutoring.app.repository;

import com.tutoring.app.domain.TutorOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TutorOfferRepository extends JpaRepository<TutorOffer, UUID> {
    List<TutorOffer> findByStudentIdOrderBySessionStartTimeAsc(UUID studentId);
    List<TutorOffer> findByTutorIdOrderBySessionStartTimeAsc(UUID tutorId);
}

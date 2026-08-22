package com.tutoring.app.session;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TutoringSessionRepository extends JpaRepository<TutoringSession, UUID> {
    boolean existsByOfferId(UUID offerId);
}

package com.tutoring.app.dev;

import com.tutoring.app.offer.TutorOffer;
import com.tutoring.app.offer.TutorOfferRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/dev")
@Profile("dev")
public class DevController {

    private final TutorOfferRepository tutorOfferRepository;

    public DevController(TutorOfferRepository tutorOfferRepository) {
        this.tutorOfferRepository = tutorOfferRepository;
    }

    /**
     * Cofa sessionStartTime oferty tak, żeby sesja "już się skończyła".
     * Dzięki temu można od razu wywołać /api/offer/confirm-payment bez czekania.
     */
    @PostMapping("/fast-forward/{offerId}")
    public ResponseEntity<String> fastForward(@PathVariable UUID offerId) {
        TutorOffer offer = tutorOfferRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found: " + offerId));
        long duration = offer.getLesson().getDurationTime();
        offer.setSessionStartTime(LocalDateTime.now().minusMinutes(duration + 1));
        tutorOfferRepository.save(offer);
        return ResponseEntity.ok("Fast-forwarded offer " + offerId + ": session end set to the past.");
    }
}

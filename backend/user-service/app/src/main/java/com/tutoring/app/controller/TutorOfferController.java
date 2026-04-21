package com.tutoring.app.controller;

import com.tutoring.app.domain.TutorOffer;
import com.tutoring.app.dto.TutorOfferDTO;
import com.tutoring.app.service.TutorOfferService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@RequestMapping("/api/offer")
public class TutorOfferController {
    private final TutorOfferService tutorOfferService;

    public TutorOfferController(TutorOfferService tutorOfferService) {
        this.tutorOfferService = tutorOfferService;
    }

    @PostMapping("/send")
    public TutorOffer makeOffer(@RequestBody TutorOfferDTO offerDTO){
        return tutorOfferService.makeOffer(offerDTO);
    }

    @PostMapping("/accept/{offerId}")
    public TutorOffer acceptOffer(@PathVariable UUID offerId){
        return tutorOfferService.acceptOffer(offerId);
    }
}

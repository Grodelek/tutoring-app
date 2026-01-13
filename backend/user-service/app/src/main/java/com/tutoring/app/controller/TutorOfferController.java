package com.tutoring.app.controller;

import com.tutoring.app.domain.TutorOffer;
import com.tutoring.app.dto.TutorOfferDTO;
import com.tutoring.app.service.ConversationService;
import com.tutoring.app.service.TutorOfferService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/offer")
public class TutorOfferController {
    private final ConversationService conversationService;
    private final TutorOfferService tutorOfferService;

    public TutorOfferController(ConversationService conversationService, TutorOfferService tutorOfferService) {
        this.conversationService = conversationService;
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

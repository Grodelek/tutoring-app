package com.tutoring.app.offer;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@Tag(name = "Tutor Offers", description = "Session offer lifecycle: create, accept, decline and confirm payment")
@RestController
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin(origins = {"http://localhost:8081","http://localhost:19006","http://localhost:19000","exp://192.168.2.167:8081","http://localhost:5173","http://192.168.1.32:5173"})
@RequestMapping("/api/offer")
public class TutorOfferController {
    private final TutorOfferService tutorOfferService;

    public TutorOfferController(TutorOfferService tutorOfferService) { this.tutorOfferService = tutorOfferService; }

    @PostMapping("/send")
    public OfferResponseDTO makeOffer(@RequestBody TutorOfferDTO offerDTO) throws Exception { return tutorOfferService.makeOffer(offerDTO); }

    @PostMapping("/accept/{offerId}")
    public OfferResponseDTO acceptOffer(@PathVariable UUID offerId) { return tutorOfferService.acceptOffer(offerId); }

    @PostMapping("/decline/{offerId}")
    public OfferResponseDTO declineOffer(@PathVariable UUID offerId) { return tutorOfferService.declineOffer(offerId); }

    @PostMapping("/confirm-payment/{offerId}")
    public OfferResponseDTO confirmPayment(@PathVariable UUID offerId) { return tutorOfferService.confirmPayment(offerId); }

    @GetMapping("/my")
    public List<OfferResponseDTO> getMyBookings() { return tutorOfferService.getMyStudentBookings(); }
}

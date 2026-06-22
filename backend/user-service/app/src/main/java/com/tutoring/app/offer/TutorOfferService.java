package com.tutoring.app.offer;

import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.lesson.LessonRepository;
import com.tutoring.app.message.MessageDTO;
import com.tutoring.app.message.MessageService;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserPrincipal;
import com.tutoring.app.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TutorOfferService {

    private static final int REWARD_POINTS = 10;

    private final UserRepository userRepository;
    private final TutorOfferRepository tutorOfferRepository;
    private final LessonRepository lessonRepository;
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public TutorOfferService(UserRepository userRepository, TutorOfferRepository tutorOfferRepository,
                             LessonRepository lessonRepository, MessageService messageService,
                             SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.tutorOfferRepository = tutorOfferRepository;
        this.lessonRepository = lessonRepository;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public OfferResponseDTO makeOffer(TutorOfferDTO offerDTO) throws Exception {
        if (offerDTO.getLessonId() == null) throw new IllegalArgumentException("Lesson ID cannot be null");
        if (offerDTO.getReceiverId() == null) throw new IllegalArgumentException("Receiver ID cannot be null");
        if (offerDTO.getSessionStartTime() == null) throw new IllegalArgumentException("Session start time cannot be null");

        User proposer = getLoggedInUser();
        User receiver = userRepository.findById(offerDTO.getReceiverId())
                .orElseThrow(() -> new EntityNotFoundException("Receiver not found"));
        Lesson lesson = lessonRepository.findById(offerDTO.getLessonId())
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found"));

        User tutor = lesson.getTutor();
        if (tutor == null) throw new IllegalArgumentException("Lesson has no tutor");

        User student;
        if (tutor.getId().equals(proposer.getId())) student = receiver;
        else if (tutor.getId().equals(receiver.getId())) student = proposer;
        else throw new IllegalArgumentException("Lesson tutor must be one of the conversation participants");

        TutorOffer offer = TutorOffer.builder()
                .tutor(tutor).student(student).lesson(lesson)
                .sessionStartTime(offerDTO.getSessionStartTime())
                .status(OfferStatus.PENDING).accepted(false).build();
        tutorOfferRepository.save(offer);

        MessageDTO invitation = messageService.sendOfferInvitation(proposer.getId(), receiver.getId(), offer);
        messagingTemplate.convertAndSend("/topic/notification", invitation);
        return new OfferResponseDTO(offer);
    }

    @Transactional
    public OfferResponseDTO acceptOffer(UUID offerId) {
        TutorOffer offer = getParticipantOffer(offerId);
        offer.setStatus(OfferStatus.ACCEPTED); offer.setAccepted(true);
        tutorOfferRepository.save(offer);
        return new OfferResponseDTO(offer);
    }

    @Transactional
    public OfferResponseDTO declineOffer(UUID offerId) {
        TutorOffer offer = getParticipantOffer(offerId);
        offer.setStatus(OfferStatus.DECLINED); offer.setAccepted(false);
        tutorOfferRepository.save(offer);
        return new OfferResponseDTO(offer);
    }

    @Transactional
    public OfferResponseDTO confirmPayment(UUID offerId) {
        TutorOffer offer = getParticipantOffer(offerId);
        User user = getLoggedInUser();
        if (offer.getStatus() != OfferStatus.ACCEPTED)
            throw new IllegalStateException("Płatność można potwierdzić tylko dla zaakceptowanych zajęć");
        LocalDateTime sessionEnd = offer.getSessionStartTime().plusMinutes(offer.getLesson().getDurationTime());
        if (LocalDateTime.now().isBefore(sessionEnd))
            throw new IllegalStateException("Płatność można potwierdzić dopiero po zakończeniu zajęć");
        if (user.getId().equals(offer.getStudent().getId())) offer.setStudentConfirmedPayment(true);
        else if (user.getId().equals(offer.getTutor().getId())) offer.setTutorConfirmedPayment(true);
        else throw new SecurityException("Nie jesteś uczestnikiem tych zajęć");
        if (offer.isStudentConfirmedPayment() && offer.isTutorConfirmedPayment() && !offer.isCompleted()) {
            grantReward(offer.getStudent()); grantReward(offer.getTutor()); offer.setCompleted(true);
        }
        tutorOfferRepository.save(offer);
        return new OfferResponseDTO(offer);
    }

    public List<OfferResponseDTO> getMyStudentBookings() {
        User user = getLoggedInUser();
        return tutorOfferRepository.findByStudentIdOrderBySessionStartTimeAsc(user.getId()).stream()
                .map(OfferResponseDTO::new).collect(Collectors.toList());
    }

    private void grantReward(User user) {
        user.setPoints((user.getPoints() == null ? 0 : user.getPoints()) + REWARD_POINTS);
        user.setStreak((user.getStreak() == null ? 0 : user.getStreak()) + 1);
        userRepository.save(user);
    }

    private TutorOffer getParticipantOffer(UUID offerId) {
        TutorOffer offer = tutorOfferRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));
        User user = getLoggedInUser();
        if (!user.getId().equals(offer.getTutor().getId()) && !user.getId().equals(offer.getStudent().getId()))
            throw new SecurityException("Nie jesteś uczestnikiem tej oferty");
        return offer;
    }

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new SecurityException("User is not authenticated");
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}

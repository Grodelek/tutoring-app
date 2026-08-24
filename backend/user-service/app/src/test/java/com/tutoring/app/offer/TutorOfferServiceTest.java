package com.tutoring.app.offer;

import com.tutoring.app.lesson.LessonRepository;
import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.message.MessageService;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserPrincipal;
import com.tutoring.app.user.UserRepository;
import com.tutoring.app.user.UserType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import com.tutoring.app.session.TutoringSessionRepository;
import com.tutoring.app.session.TutoringSession;
import com.tutoring.app.session.SessionStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorOfferServiceTest {
    @Mock UserRepository userRepository;
    @Mock TutorOfferRepository tutorOfferRepository;
    @Mock LessonRepository lessonRepository;
    @Mock MessageService messageService;
    @Mock SimpMessagingTemplate messagingTemplate;
    @Mock TutoringSessionRepository tutoringSessionRepository;
    @InjectMocks TutorOfferService service;
    private User student;
    private User tutor;
    private TutorOffer offer;

    @BeforeEach void setUp() {
        student = User.builder().id(UUID.randomUUID()).username("student").userType(UserType.STUDENT).build();
        tutor = User.builder().id(UUID.randomUUID()).username("tutor").userType(UserType.TUTOR).build();
        offer = TutorOffer.builder().id(UUID.randomUUID()).student(student).tutor(tutor).status(OfferStatus.PENDING).build();
    }

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test void tutorCanAcceptPendingOffer() {
        foundOffer();
        authenticate(tutor);
        when(tutoringSessionRepository.existsByOfferId(offer.getId())).thenReturn(false);
        service.acceptOffer(offer.getId());
        assertEquals(OfferStatus.ACCEPTED, offer.getStatus());
        verify(tutorOfferRepository).save(offer);
    }

    @Test void studentCannotAcceptOffer() {
        foundOffer();
        authenticate(student);
        assertThrows(SecurityException.class, () -> service.acceptOffer(offer.getId()));
        verify(tutorOfferRepository, never()).save(offer);
    }

    @Test void completedStatusCannotBeChanged() {
        foundOffer();
        offer.setStatus(OfferStatus.ACCEPTED);
        authenticate(student);
        assertThrows(IllegalStateException.class, () -> service.declineOffer(offer.getId()));
    }

    @Test void missingOfferIsReported() {
        UUID absent = UUID.randomUUID();
        when(tutorOfferRepository.findById(absent)).thenReturn(Optional.empty());
        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> service.acceptOffer(absent));
    }

    @Test void myBookingsAreSelectedByAuthenticatedRole() {
        when(tutorOfferRepository.findByTutorIdOrderBySessionStartTimeAsc(tutor.getId())).thenReturn(List.of(offer));
        authenticate(tutor);
        assertEquals(1, service.getMyBookings().size());
        verify(tutorOfferRepository).findByTutorIdOrderBySessionStartTimeAsc(tutor.getId());

        when(tutorOfferRepository.findByStudentIdOrderBySessionStartTimeAsc(student.getId())).thenReturn(List.of(offer));
        authenticate(student);
        assertEquals(1, service.getMyBookings().size());
        verify(tutorOfferRepository).findByStudentIdOrderBySessionStartTimeAsc(student.getId());
    }

    @Test void studentCanCreateOfferForLessonsTutor() throws Exception {
        Lesson lesson = Lesson.builder().id(UUID.randomUUID()).tutor(tutor).durationTime(60).build();
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        authenticate(student);
        service.makeOffer(offerRequest(lesson.getId(), tutor.getId()));
        var captor = org.mockito.ArgumentCaptor.forClass(TutorOffer.class);
        verify(tutorOfferRepository).save(captor.capture());
        assertEquals(student.getId(), captor.getValue().getStudent().getId());
        assertEquals(tutor.getId(), captor.getValue().getTutor().getId());
    }

    @Test void tutorCannotCreateOffer() {
        authenticate(tutor);
        assertThrows(SecurityException.class, () -> service.makeOffer(offerRequest(UUID.randomUUID(), student.getId())));
        verify(tutorOfferRepository, never()).save(any());
    }

    @Test void studentCannotCreateOfferForMissingLessonOrSelf() {
        authenticate(student);
        UUID missing = UUID.randomUUID();
        when(lessonRepository.findById(missing)).thenReturn(Optional.empty());
        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> service.makeOffer(offerRequest(missing, tutor.getId())));
        Lesson ownLesson = Lesson.builder().id(UUID.randomUUID()).tutor(student).build();
        when(lessonRepository.findById(ownLesson.getId())).thenReturn(Optional.of(ownLesson));
        assertThrows(SecurityException.class, () -> service.makeOffer(offerRequest(ownLesson.getId(), student.getId())));
    }

    @Test void sessionBecomesSuccessfulOnlyAfterBothConfirmationsAndIsIdempotent() {
        Lesson lesson = Lesson.builder().id(UUID.randomUUID()).tutor(tutor).durationTime(60).build();
        offer.setLesson(lesson); offer.setStatus(OfferStatus.ACCEPTED);
        offer.setSessionStartTime(LocalDateTime.now().minusHours(2));
        TutoringSession session = TutoringSession.builder().id(UUID.randomUUID()).offer(offer)
                .student(student).tutor(tutor).lesson(lesson).startTime(offer.getSessionStartTime())
                .status(SessionStatus.SCHEDULED).build();
        foundOffer();
        when(tutoringSessionRepository.findByOfferId(offer.getId())).thenReturn(Optional.of(session));
        authenticate(student);
        service.confirmPayment(offer.getId());
        assertFalse(offer.isCompleted());
        assertEquals(SessionStatus.SCHEDULED, session.getStatus());
        verify(tutoringSessionRepository, never()).save(any());
        authenticate(tutor);
        service.confirmPayment(offer.getId());
        assertTrue(offer.isCompleted());
        assertEquals(SessionStatus.SUCCESSFUL, session.getStatus());
        verify(tutoringSessionRepository).save(session);
        service.confirmPayment(offer.getId());
        verify(tutoringSessionRepository, times(1)).save(session);
    }

    private void authenticate(User user) {
        when(userRepository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new UserPrincipal(user), null, List.of()));
    }

    private void foundOffer() { when(tutorOfferRepository.findById(offer.getId())).thenReturn(Optional.of(offer)); }

    private TutorOfferDTO offerRequest(UUID lessonId, UUID receiverId) {
        TutorOfferDTO dto = new TutorOfferDTO();
        dto.setLessonId(lessonId); dto.setReceiverId(receiverId);
        dto.setSessionStartTime(LocalDateTime.now().plusDays(1));
        return dto;
    }
}

package com.tutoring.app.offer;

import com.tutoring.app.lesson.LessonRepository;
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
import com.tutoring.app.session.TutoringSessionRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

    private void authenticate(User user) {
        when(userRepository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new UserPrincipal(user), null, List.of()));
    }

    private void foundOffer() { when(tutorOfferRepository.findById(offer.getId())).thenReturn(Optional.of(offer)); }
}

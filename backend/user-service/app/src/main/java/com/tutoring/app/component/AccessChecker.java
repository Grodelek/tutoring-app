package com.tutoring.app.component;

import com.tutoring.app.domain.User;
import com.tutoring.app.domain.UserPrincipal;
import com.tutoring.app.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("accessChecker")
public class AccessChecker {

    private final UserRepository userRepository;

    public AccessChecker(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isTutorProfileComplete(Authentication auth){
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String username = principal.getUsername();
        Optional<User> userOptional = userRepository.findByUsername(username);
        if(userOptional.isEmpty()) {
            throw new EntityNotFoundException("User not found");
        }
        User user = userOptional.get();
        if (!user.getUserType().equals("TUTOR")) return true;

        return user.getExperienceTime() != null &&
                user.getAvailability() != null &&
                user.getLessonType() != null;
    }
}
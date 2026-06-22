package com.tutoring.app.discovery;

import com.tutoring.app.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tutors/discover")
@RequiredArgsConstructor
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin
public class TutorDiscoveryController {
  private final TutorDiscoveryService tutorDiscoveryService;

  @PostMapping("/search")
  public ResponseEntity<List<TutorSearchResultDTO>> searchTutors(
      @AuthenticationPrincipal UserPrincipal userDetails,
      @RequestBody TutorSearchRequestDTO request) {
    return ResponseEntity.ok(tutorDiscoveryService.searchTutors(userDetails, request));
  }
}

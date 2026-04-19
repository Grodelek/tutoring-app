package com.tutoring.app.controller;

import com.tutoring.app.dto.TutorSearchRequestDTO;
import com.tutoring.app.dto.TutorSearchResultDTO;
import com.tutoring.app.service.TutorDiscoveryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tutors/discover")
@RequiredArgsConstructor
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin
public class TutorDiscoveryController {

  private final TutorDiscoveryService tutorDiscoveryService;

  @PostMapping("/search")
  public ResponseEntity<List<TutorSearchResultDTO>> searchTutors(
      @RequestBody TutorSearchRequestDTO request) {
    return ResponseEntity.ok(tutorDiscoveryService.searchTutors(request));
  }
}


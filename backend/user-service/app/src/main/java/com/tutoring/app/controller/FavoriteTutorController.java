package com.tutoring.app.controller;

import com.tutoring.app.dto.FavoriteTutorDTO;
import com.tutoring.app.service.FavoriteTutorService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin
public class FavoriteTutorController {

  private final FavoriteTutorService favoriteTutorService;

  @PostMapping("/add")
  public ResponseEntity<FavoriteTutorDTO> addFavorite(@RequestBody FavoriteTutorDTO request) {
    FavoriteTutorDTO created = favoriteTutorService.addFavorite(request.getStudentId(), request.getTutorId());
    return ResponseEntity.ok(created);
  }

  @DeleteMapping("/remove/{studentId}/{tutorId}")
  public ResponseEntity<Void> removeFavorite(
      @PathVariable UUID studentId,
      @PathVariable UUID tutorId) {
    favoriteTutorService.removeFavorite(studentId, tutorId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/student/{studentId}")
  public ResponseEntity<List<FavoriteTutorDTO>> getFavorites(@PathVariable UUID studentId) {
    return ResponseEntity.ok(favoriteTutorService.getFavoritesForStudent(studentId));
  }
}


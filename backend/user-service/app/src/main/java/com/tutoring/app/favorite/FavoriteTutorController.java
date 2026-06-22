package com.tutoring.app.favorite;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/favorites") @RequiredArgsConstructor
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)") @CrossOrigin
public class FavoriteTutorController {
  private final FavoriteTutorService favoriteTutorService;

  @PostMapping("/add")
  public ResponseEntity<FavoriteTutorDTO> addFavorite(@RequestBody FavoriteTutorDTO request) {
    return ResponseEntity.ok(favoriteTutorService.addFavorite(request.getStudentId(), request.getTutorId()));
  }

  @DeleteMapping("/remove/{studentId}/{tutorId}")
  public ResponseEntity<Void> removeFavorite(@PathVariable UUID studentId, @PathVariable UUID tutorId) {
    favoriteTutorService.removeFavorite(studentId, tutorId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/student/{studentId}")
  public ResponseEntity<List<FavoriteTutorDTO>> getFavorites(@PathVariable UUID studentId) {
    return ResponseEntity.ok(favoriteTutorService.getFavoritesForStudent(studentId));
  }
}

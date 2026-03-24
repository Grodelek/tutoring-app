package com.tutoring.app.service;

import com.tutoring.app.domain.FavoriteTutor;
import com.tutoring.app.domain.User;
import com.tutoring.app.dto.FavoriteTutorDTO;
import com.tutoring.app.repository.FavoriteTutorRepository;
import com.tutoring.app.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FavoriteTutorService {

  private final FavoriteTutorRepository favoriteTutorRepository;
  private final UserRepository userRepository;

  public FavoriteTutorDTO addFavorite(UUID studentId, UUID tutorId) {
    if (studentId.equals(tutorId)) {
      throw new IllegalArgumentException("Student and tutor cannot be the same user");
    }

    FavoriteTutor existing = favoriteTutorRepository
        .findByStudentIdAndTutorId(studentId, tutorId)
        .orElse(null);

    if (existing != null) {
      return toDto(existing);
    }

    User student = userRepository
        .findById(studentId)
        .orElseThrow(() -> new EntityNotFoundException("Student not found"));
    User tutor = userRepository
        .findById(tutorId)
        .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));

    FavoriteTutor favorite = FavoriteTutor
        .builder()
        .student(student)
        .tutor(tutor)
        .build();

    FavoriteTutor saved = favoriteTutorRepository.save(favorite);
    return toDto(saved);
  }

  public void removeFavorite(UUID studentId, UUID tutorId) {
    favoriteTutorRepository
        .findByStudentIdAndTutorId(studentId, tutorId)
        .ifPresent(favoriteTutorRepository::delete);
  }

  public List<FavoriteTutorDTO> getFavoritesForStudent(UUID studentId) {
    return favoriteTutorRepository
        .findByStudentId(studentId)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  private FavoriteTutorDTO toDto(FavoriteTutor favorite) {
    User tutor = favorite.getTutor();
    return FavoriteTutorDTO
        .builder()
        .id(favorite.getId())
        .studentId(favorite.getStudent().getId())
        .tutorId(tutor.getId())
        .tutorUsername(tutor.getUsername())
        .tutorPhotoPath(tutor.getPhotoPath())
        .tutorDescription(tutor.getDescription())
        .build();
  }
}



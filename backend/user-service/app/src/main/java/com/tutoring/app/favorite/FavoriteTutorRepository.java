package com.tutoring.app.favorite;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteTutorRepository extends JpaRepository<FavoriteTutor, UUID> {
  Optional<FavoriteTutor> findByStudentIdAndTutorId(UUID studentId, UUID tutorId);
  List<FavoriteTutor> findByStudentId(UUID studentId);
}

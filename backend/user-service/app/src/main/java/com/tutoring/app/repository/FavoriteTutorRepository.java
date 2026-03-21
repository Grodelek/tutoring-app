package com.tutoring.app.repository;

import com.tutoring.app.domain.FavoriteTutor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteTutorRepository extends JpaRepository<FavoriteTutor, UUID> {

  Optional<FavoriteTutor> findByStudentIdAndTutorId(UUID studentId, UUID tutorId);

  List<FavoriteTutor> findByStudentId(UUID studentId);
}


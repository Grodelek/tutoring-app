package com.tutoring.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.tutoring.app.domain.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
  @Query("SELECT c FROM Conversation c WHERE " +
      "c.user1.id = :userId OR c.user2.id = :userId")
  List<Conversation> findByUser1IdOrUser2Id(@Param("userId") UUID userId);

  @Query("SELECT c FROM Conversation c WHERE " +
      "(c.user1.id = :userA AND c.user2.id = :userB) OR " +
      "(c.user1.id = :userB AND c.user2.id = :userA)")
  Optional<Conversation> findByUsers(@Param("userA") UUID userA, @Param("userB") UUID userB);
}

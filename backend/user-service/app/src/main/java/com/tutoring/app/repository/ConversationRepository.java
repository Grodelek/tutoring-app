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
  List<Conversation> findByUser1IdOrUser2Id(UUID user1Id, UUID user2Id);

  @Query("SELECT c FROM Conversation c WHERE " +
      "(c.user1Id = :userA AND c.user2Id = :userB) OR " +
      "(c.user1Id = :userB AND c.user2Id = :userA)")
  Optional<Conversation> findByUsers(@Param("userA") UUID userA, @Param("userB") UUID userB);
}

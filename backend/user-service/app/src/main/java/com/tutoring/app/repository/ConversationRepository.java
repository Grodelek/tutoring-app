package com.tutoring.app.repository;

import java.time.LocalDateTime;
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

  interface ConversationLastMessageProjection {
    UUID getConversationId();
    LocalDateTime getLastMessageAt();
  }

  @Query("SELECT c.id as conversationId, MAX(m.timestamp) as lastMessageAt " +
         "FROM Conversation c LEFT JOIN c.messages m " +
         "WHERE c.user1.id = :userId OR c.user2.id = :userId " +
         "GROUP BY c.id")
  List<ConversationLastMessageProjection> findLastMessageTimestamps(@Param("userId") UUID userId);
}

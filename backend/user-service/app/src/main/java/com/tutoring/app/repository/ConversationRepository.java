package com.tutoring.app.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tutoring.app.model.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
  List<Conversation> findByUser1IdOrUser2Id(UUID user1Id, UUID user2Id);
}

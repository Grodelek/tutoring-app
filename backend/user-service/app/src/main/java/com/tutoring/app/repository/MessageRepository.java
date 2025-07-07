package com.tutoring.app.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tutoring.app.model.Message;

public interface MessageRepository extends JpaRepository<Message, UUID> {
  List<Message> findByConversationIdOrderByTimestampAsc(UUID conversationId);
}

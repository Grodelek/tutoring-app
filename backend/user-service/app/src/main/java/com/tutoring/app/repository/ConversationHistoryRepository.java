package com.tutoring.app.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.tutoring.app.model.ConversationHistory;

@Repository
public interface ConversationHistoryRepository extends JpaRepository<ConversationHistory, UUID> {

}

package com.tutoring.app.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
  List<Message> findByConversationIdOrderByTimestampAsc(UUID conversationId);

  @Modifying
  @Query("UPDATE Message m SET m.lesson = null WHERE m.lesson.id = :lessonId")
  void detachLesson(@Param("lessonId") UUID lessonId);
}

package com.tutoring.app.service;

import com.tutoring.app.domain.Lesson;
import com.tutoring.app.domain.User;
import com.tutoring.app.dto.TutorSearchRequestDTO;
import com.tutoring.app.dto.TutorSearchResultDTO;
import com.tutoring.app.repository.LessonRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorDiscoveryService {

  private final LessonRepository lessonRepository;

  public List<TutorSearchResultDTO> searchTutors(TutorSearchRequestDTO request) {
    List<Lesson> lessons = lessonRepository.findAll();

    if (request.getUserId() != null) {
      log.debug("Tutor discovery for userId={} - total lessons before filter: {}",
          request.getUserId(), lessons.size());
    }

    // Filter only lessons that have a tutor and are available (if status is used)
    List<Lesson> filtered = lessons.stream()
        .filter(lesson -> lesson.getTutor() != null)
        // do not return own offers
        .filter(lesson -> {
          if (request.getUserId() == null) {
            return true;
          }
          boolean isOwn = lesson.getTutor().getId().equals(request.getUserId());
          if (isOwn) {
            log.debug("Filtering out own lesson {} for tutor {}", lesson.getId(),
                lesson.getTutor().getId());
          }
          return !isOwn;
        })
        .filter(lesson -> request.getSubject() == null
            || lesson.getSubject() != null
            && lesson.getSubject().equalsIgnoreCase(request.getSubject()))
        .filter(lesson -> matchesPriceRange(lesson, request.getMinPrice(), request.getMaxPrice()))
        .collect(Collectors.toList());

    // Group by tutor and pick one representative lesson per tutor
    Map<UUID, Lesson> representativeLessonPerTutor = filtered.stream()
        .collect(Collectors.toMap(
            lesson -> lesson.getTutor().getId(),
            lesson -> lesson,
            // if multiple lessons per tutor, keep the cheapest
            (l1, l2) -> {
              if (l1.getPrice() == null) return l2;
              if (l2.getPrice() == null) return l1;
              return l1.getPrice().compareTo(l2.getPrice()) <= 0 ? l1 : l2;
            }
        ));

    // Compute score per tutor
    return representativeLessonPerTutor.values().stream()
        .map(lesson -> toResultWithScore(lesson, request))
        .sorted(Comparator.comparingDouble(TutorSearchResultDTO::getRating).reversed())
        .limit(5)
        .collect(Collectors.toList());
  }

  private boolean matchesPriceRange(Lesson lesson, BigDecimal minPrice, BigDecimal maxPrice) {
    if (lesson.getPrice() == null) {
      return true;
    }
    if (minPrice != null && lesson.getPrice().compareTo(minPrice) < 0) {
      return false;
    }
    return maxPrice == null || lesson.getPrice().compareTo(maxPrice) <= 0;
  }

  private TutorSearchResultDTO toResultWithScore(Lesson lesson, TutorSearchRequestDTO request) {
    User tutor = lesson.getTutor();

    double score = 0.0;

    // Subject match
    if (request.getSubject() != null && lesson.getSubject() != null
        && lesson.getSubject().equalsIgnoreCase(request.getSubject())) {
      score += 50.0;
    }

    // Price scoring: middle of range gets more points
    if (lesson.getPrice() != null && request.getMinPrice() != null && request.getMaxPrice() != null) {
      BigDecimal mid = request.getMinPrice()
          .add(request.getMaxPrice())
          .divide(BigDecimal.valueOf(2), BigDecimal.ROUND_HALF_UP);
      BigDecimal diff = lesson.getPrice().subtract(mid).abs();
      // linear penalty – closer to mid is better
      score += Math.max(0, 30 - diff.doubleValue());
    } else if (lesson.getPrice() != null && (request.getMinPrice() != null || request.getMaxPrice() != null)) {
      score += 10.0;
    }

    // Simple rating derived from user points (for now)
    int points = tutor.getPoints() != null ? tutor.getPoints() : 0;
    double baseRating = Math.min(5.0, 1.0 + points / 100.0); // map points to ~1-5 stars

    if (request.getMinRating() != null && baseRating < request.getMinRating()) {
      // hard filter – if rating is below minRating, give very low score
      score -= 100;
    } else {
      score += baseRating * 10;
    }

    // store score in rating field for now so we can sort and also show something meaningful
    return TutorSearchResultDTO
        .builder()
        .tutorId(tutor.getId())
        .tutorUsername(tutor.getUsername())
        .tutorPhotoPath(tutor.getPhotoPath())
        .tutorDescription(tutor.getDescription())
        .lessonId(lesson.getId())
        .subject(lesson.getSubject())
        .lessonDescription(lesson.getDescription())
        .durationTime(lesson.getDurationTime())
        .price(lesson.getPrice())
        .rating(score)
        .build();
  }
}





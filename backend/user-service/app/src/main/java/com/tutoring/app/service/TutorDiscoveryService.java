package com.tutoring.app.service;

import com.tutoring.app.domain.*;
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

    List<Lesson> filtered = lessons.stream()
        .filter(lesson -> lesson.getTutor() != null)
        .filter(lesson -> {
          if (request.getUserId() == null) {
            return true;
          }
          boolean isOwn = lesson.getTutor().getId().equals(request.getUserId());
          return !isOwn;
        })
        .filter(lesson -> request.getSubject() == null
            || lesson.getSubject() != null
            && lesson.getSubject().equalsIgnoreCase(request.getSubject()))
        .filter(lesson -> matchesPriceRange(lesson, request.getMinPrice(), request.getMaxPrice()))
        .collect(Collectors.toList());

    Map<UUID, Lesson> representativeLessonPerTutor = filtered.stream()
        .collect(Collectors.toMap(
            lesson -> lesson.getTutor().getId(),
            lesson -> lesson,
            (l1, l2) -> {
              if (l1.getPrice() == null) return l2;
              if (l2.getPrice() == null) return l1;
              return l1.getPrice().compareTo(l2.getPrice()) <= 0 ? l1 : l2;
            }
        ));

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

    if (request.getSubject() != null && lesson.getSubject() != null
        && lesson.getSubject().equalsIgnoreCase(request.getSubject())) {
      score += 20.0;
    }

    double priceScore = 0.0;
    if (lesson.getPrice() != null && request.getMinPrice() != null && request.getMaxPrice() != null) {
      BigDecimal mid = request.getMinPrice()
           .add(request.getMaxPrice())
           .divide(BigDecimal.valueOf(2));
      BigDecimal diff = lesson.getPrice().subtract(mid).abs();
      priceScore = Math.max(0, 25 - diff.doubleValue());
    } else if (lesson.getPrice() != null && (request.getMinPrice() != null || request.getMaxPrice() != null)) {
      priceScore = 10.0;
    }

    Integer priceImportance = request.getPriceImportance();
    if (priceImportance == null) {
      priceImportance = 3;
    }
    double priceWeightFactor = 0.5 + 0.5 * (Math.min(5, Math.max(1, priceImportance)) / 5.0);
    score += priceScore * priceWeightFactor;

    LessonType preferredStyle = request.getPreferredTeachingStyle();
    LessonType tutorStyle = tutor.getTeachingStyle();
    if (preferredStyle != null && tutorStyle != null) {
      if (tutorStyle == preferredStyle) {
        score += 20.0;
      } else if (tutorStyle == LessonType.FLEXIBLE) {
        score += 15.0;
      }
    }

    UserType preferredUserType = request.getPreferredUserType();
    UserType tutorType = tutor.getUserType();
    if (preferredUserType != null && tutorType != null) {
      if (tutorType == preferredUserType) {
        score += 15.0;
      }
    }

    Availability preferredAvailability = request.getPreferredAvailability();
    Availability tutorAvailability = tutor.getAvailability();
    if (preferredAvailability != null && tutorAvailability != null
        && preferredAvailability == tutorAvailability) {
      score += 15.0;
    }

    int points = tutor.getPoints() != null ? tutor.getPoints() : 0;
    double baseRating = Math.min(5.0, 1.0 + points / 100.0);

    if (request.getMinRating() != null && baseRating < request.getMinRating()) {
      score -= 100;
    } else {
      score += baseRating * 2.0;
    }

    double randomFactor = 0.8 + Math.random() * 0.4;
    double finalScore = score * randomFactor;

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
        .rating(finalScore)
        .tutorTeachingStyle(tutor.getTeachingStyle())
        .tutorUserType(tutor.getUserType())
        .tutorAvailability(tutor.getAvailability())
        .build();
  }
}





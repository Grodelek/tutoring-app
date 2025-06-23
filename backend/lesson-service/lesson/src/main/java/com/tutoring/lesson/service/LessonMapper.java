package com.tutoring.lesson.service;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tutoring.lesson.dto.LessonRequestDTO;
import com.tutoring.lesson.dto.LessonResponseDTO;
import com.tutoring.lesson.model.Lesson;

@Mapper(componentModel = "spring")
public interface LessonMapper {
  Lesson toEntity(LessonRequestDTO dto);

  LessonResponseDTO toDTO(Lesson lesson);
}

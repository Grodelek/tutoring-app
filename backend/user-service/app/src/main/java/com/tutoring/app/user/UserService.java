package com.tutoring.app.user;

import java.util.*;
import java.util.stream.Collectors;
import java.text.Normalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static com.tutoring.app.user.UserType.STUDENT;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JWTService jwtService;
  private final Logger logger = LoggerFactory.getLogger(UserService.class);

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                     AuthenticationManager authenticationManager, JWTService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  public List<User> getUsers() { return userRepository.findAll(); }

  public User register(UserLoginDTO userDTO) {
    if (userRepository.existsByEmail(userDTO.getEmail())) {
      throw new IllegalArgumentException("User already has an account.");
    }
    Set<String> roles = new HashSet<>();
    roles.add("ROLE_USER");
    User user = User.builder()
            .username(userDTO.getUsername())
            .email(userDTO.getEmail())
            .points(0)
            .password(passwordEncoder.encode(userDTO.getPassword()))
            .roles(roles)
            .userType(userDTO.getUserType())
            .slug(generateUniqueSlug(userDTO.getUsername()))
            .photoPath("https://ui-avatars.com/api/?name=" + userDTO.getUsername() + "&background=random&bold=true&color=fff")
            .build();
    userRepository.save(user);
    return user;
  }

  private String generateUniqueSlug(String username) {
    String base = generateSlugFrom(username);
    if (!userRepository.existsBySlug(base)) return base;
    int i = 2;
    while (userRepository.existsBySlug(base + "-" + i)) i++;
    return base + "-" + i;
  }

  private String generateSlugFrom(String username) {
    if (username == null) return "";
    return Normalizer.normalize(username, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replaceAll("([a-z])([A-Z])", "$1-$2")
            .toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "");
  }

  public PublicTutorProfileDTO getPublicProfile(String slug) {
    User user = userRepository.findBySlug(slug)
            .or(() -> userRepository.findAll().stream()
                    .filter(u -> slug.equals(generateSlugFrom(u.getUsername())))
                    .findFirst()
                    .map(u -> { if (u.getSlug() == null) { u.setSlug(generateUniqueSlug(u.getUsername())); userRepository.save(u); } return u; }))
            .orElseThrow(() -> new EntityNotFoundException("Tutor not found"));
    List<PublicTutorProfileDTO.PublicLessonDTO> lessons = user.getLessons().stream()
            .map(l -> PublicTutorProfileDTO.PublicLessonDTO.builder()
                    .id(l.getId()).subject(l.getSubject())
                    .durationTime(l.getDurationTime()).price(l.getPrice())
                    .description(l.getDescription()).build())
            .collect(Collectors.toList());
    return PublicTutorProfileDTO.builder()
            .id(user.getId()).username(user.getUsername()).slug(user.getSlug())
            .photoPath(user.getPhotoPath()).description(user.getDescription())
            .points(user.getPoints()).userType(user.getUserType())
            .experienceTime(user.getExperienceTime()).availability(user.getAvailability())
            .lessonType(user.getLessonType()).lessons(lessons).build();
  }

  public ResponseEntity<String> delete(UUID id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isPresent()) {
      userRepository.delete(userOptional.get());
      return new ResponseEntity<>("User " + userOptional.get().getUsername() + " deleted", HttpStatus.OK);
    }
    return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
  }

  @Transactional
  public ResponseEntity<Map<String, Object>> verify(UserLoginDTO userDTO) {
    try {
      Optional<User> userOptional = userRepository.findByEmail(userDTO.getEmail());
      if (userOptional.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
      }
      User user = userOptional.get();
      if (user.getSlug() == null) { user.setSlug(generateUniqueSlug(user.getUsername())); userRepository.save(user); }
      authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(user.getUsername(), userDTO.getPassword()));
      String token = jwtService.generateToken(user.getUsername());
      return ResponseEntity.ok(Map.of(
              "token", token,
              "userId", user.getId(),
              "userType", user.getUserType(),
              "tutorProfileComplete", isTutorProfileComplete(user)));
    } catch (AuthenticationException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication failed"));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred"));
    }
  }

  @Cacheable(value = "users_dto", key = "#id")
  public UserDTO getUserById(UUID id) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with this id" + id));
    return UserDTO.builder()
            .username(user.getUsername())
            .email(user.getEmail())
            .description(user.getDescription())
            .points(user.getPoints())
            .photoPath(user.getPhotoPath())
            .streak(user.getStreak() == null ? 0 : user.getStreak())
            .build();
  }

  @Cacheable(value = "users", key = "#username")
  public User findByUsername(String username) {
    return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }

  public User updateUserProfile(UUID id, UpdateUserProfileRequest request) {
    User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with this id" + id));
    if (request.getUsername() != null) user.setUsername(request.getUsername());
    if (request.getDescription() != null) user.setDescription(request.getDescription());
    return userRepository.save(user);
  }

  public void uploadPhoto(String photoUrl, User user) {
    if (photoUrl == null || photoUrl.isEmpty()) throw new IllegalArgumentException("Invalid photoUrl");
    user.setPhotoPath(photoUrl.substring(1, photoUrl.length() - 1));
    userRepository.save(user);
  }

  public TutorInfoResponse addTutorInfo(TutorInfoDTO tutorInfoDTO, UserDetails userDetails) throws Exception {
    User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
    user.setAvailability(tutorInfoDTO.getAvailability());
    user.setExperienceTime(tutorInfoDTO.getExperienceTime());
    user.setLessonType(tutorInfoDTO.getLessonType());
    if (user.getUserType().equals(STUDENT)) throw new Exception("Only tutors can add tutor info");
    userRepository.save(user);
    return TutorInfoResponse.builder()
            .availability(user.getAvailability())
            .experienceTime(user.getExperienceTime())
            .lessonType(user.getLessonType())
            .build();
  }

  private boolean isTutorProfileComplete(User user) {
    if (user.getUserType() != UserType.TUTOR) return true;
    return user.getExperienceTime() != null && user.getAvailability() != null && user.getLessonType() != null;
  }

  public TutorWithInfoResponse getTutorInfo(UserDetails userDetails) {
    User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
    return TutorWithInfoResponse.builder()
            .username(user.getUsername())
            .experienceTime(user.getExperienceTime())
            .availability(user.getAvailability())
            .lessonType(user.getLessonType())
            .build();
  }
}

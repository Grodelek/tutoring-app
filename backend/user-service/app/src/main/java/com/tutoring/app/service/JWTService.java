package com.tutoring.app.service;

import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.tutoring.app.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JWTService {
  @Value("${jwt.secret}")
  private String key;
  private UserRepository userRepository;

  private SecretKey secretKey;

  @Autowired
  public JWTService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @PostConstruct
  public void init() {
    byte[] keyBytes = Decoders.BASE64.decode(key);
    this.secretKey = Keys.hmacShaKeyFor(keyBytes);
  }

  private SecretKey getKey() {
    return this.secretKey;
  }

  public JWTService() throws NoSuchAlgorithmException {
    try {
      KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
      SecretKey sk = keyGenerator.generateKey();
      key = Base64.getEncoder().encodeToString(sk.getEncoded());
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException();
    }
  }

  public String generateToken(String username) {
    Map<String, Object> claims = new HashMap<>();

    String token = Jwts.builder()
        .claims()
        .add(claims)
        .subject(username)
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + 10000 * 60 * 30))
        .and()
        .signWith(getKey())
        .compact();

    System.out.println("Generated token for user " + username + ": " + token);
    return token;
  }

  public String extractUserName(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
    final Claims claims = extractAllClaims(token);
    return claimResolver.apply(claims);
  }

  private Claims extractAllClaims(String token) {
    if (token == null || token.trim().isEmpty()) {
      throw new IllegalArgumentException("JWT token cannot be null or empty");
    }
    return Jwts.parser()
        .verifyWith(getKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public boolean validateToken(String token, UserDetails userDetails) {
    if (token == null || token.trim().isEmpty()) {
      return false;
    }
    try {
      final String username = extractUserName(token);
      return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    } catch (Exception e) {
      return false;
    }
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }
}

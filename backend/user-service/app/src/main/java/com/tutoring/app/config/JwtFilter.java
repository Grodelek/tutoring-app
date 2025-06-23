package com.tutoring.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.tutoring.app.service.JWTService;
import com.tutoring.app.service.MyUserDetailsService;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final JWTService jwtService;
  private final ApplicationContext applicationContext;

  public JwtFilter(JWTService jwtService, ApplicationContext applicationContext) {
    this.jwtService = jwtService;
    this.applicationContext = applicationContext;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String authHeader = request.getHeader("Authorization");
    System.out.println("Authorization header: " + authHeader);

    String token = null;
    String username = null;

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      username = jwtService.extractUserName(token);
      System.out.println("Extracted username from token: " + username);
    } else {
      System.out.println("No valid Bearer token found");
    }

    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      UserDetails userDetails = applicationContext.getBean(MyUserDetailsService.class).loadUserByUsername(username);
      if (jwtService.validateToken(token, userDetails)) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null,
            userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        System.out.println("Authentication set in context for user: " + username);
      } else {
        System.out.println("Token validation failed");
      }
    }

    filterChain.doFilter(request, response);
  }
}

package com.tutoring.app.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(1, TimeUnit.HOURS)
            .maximumSize(10_000)
            .build();

    private Bucket createBucket(String path) {
        if (path.startsWith("/api/users/login")) {
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(5).refillIntervally(5, Duration.ofMinutes(15)).build())
                    .build();
        }
        if (path.startsWith("/api/users/add")) {
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(10).refillIntervally(10, Duration.ofHours(1)).build())
                    .build();
        }
        if (path.startsWith("/api/messages")) {
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(30).refillIntervally(30, Duration.ofMinutes(1)).build())
                    .build();
        }
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(60).refillIntervally(60, Duration.ofMinutes(1)).build())
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }

        String path = request.getRequestURI();
        String key = ip + ":" + path;
        Bucket bucket = buckets.get(key, k -> createBucket(path));

        if (bucket.tryConsume(1)) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            chain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded. Please try again later.\"}");
        }
    }
}

package com.tutoring.app.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RateLimitFilterTest {
    @Test
    void loginAllowsFiveRequestsAndRejectsTheSixthForTheSameIp() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = request("/api/users/login", "198.51.100.10");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }
        MockHttpServletResponse rejected = new MockHttpServletResponse();
        filter.doFilter(request("/api/users/login", "198.51.100.10"), rejected, chain);
        assertEquals(429, rejected.getStatus());
        verify(chain, times(5)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void differentIpsHaveIndependentBuckets() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 5; i++) filter.doFilter(request("/api/users/login", "198.51.100.11"), new MockHttpServletResponse(), chain);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request("/api/users/login", "198.51.100.12"), response, chain);
        assertEquals(200, response.getStatus());
    }

    private MockHttpServletRequest request(String uri, String ip) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", uri);
        request.setRemoteAddr(ip);
        return request;
    }
}

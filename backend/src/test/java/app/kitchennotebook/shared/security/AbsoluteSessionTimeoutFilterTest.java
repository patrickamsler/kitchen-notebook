package app.kitchennotebook.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;

class AbsoluteSessionTimeoutFilterTest {

    private static final Duration ABSOLUTE_TIMEOUT = Duration.ofHours(24);

    @Test
    @DisplayName("invalidates a session older than the absolute timeout")
    void invalidatesSession_whenOlderThanAbsoluteTimeout() throws Exception {
        // given a session created more than 24 hours ago
        MockHttpSession session = new MockHttpSession();
        Clock later = Clock.fixed(Instant.ofEpochMilli(session.getCreationTime()).plus(Duration.ofHours(25)),
                ZoneOffset.UTC);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSession(session);

        // when
        new AbsoluteSessionTimeoutFilter(ABSOLUTE_TIMEOUT, later)
                .doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        // then
        assertThat(session.isInvalid()).isTrue();
    }

    @Test
    @DisplayName("keeps a session younger than the absolute timeout")
    void keepsSession_whenYoungerThanAbsoluteTimeout() throws Exception {
        // given a session created an hour ago
        MockHttpSession session = new MockHttpSession();
        Clock later = Clock.fixed(Instant.ofEpochMilli(session.getCreationTime()).plus(Duration.ofHours(1)),
                ZoneOffset.UTC);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSession(session);

        // when
        new AbsoluteSessionTimeoutFilter(ABSOLUTE_TIMEOUT, later)
                .doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        // then
        assertThat(session.isInvalid()).isFalse();
    }
}

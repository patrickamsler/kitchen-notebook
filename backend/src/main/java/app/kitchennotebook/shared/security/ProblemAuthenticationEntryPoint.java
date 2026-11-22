package app.kitchennotebook.shared.security;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import app.kitchennotebook.shared.web.ProblemDetailsFactory;
import app.kitchennotebook.shared.web.ProblemResponseWriter;

/**
 * Answers unauthenticated API requests with 401 problem details instead of a redirect to sign-in (PLT-01).
 */
@Component
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ProblemDetailsFactory problems;
    private final ProblemResponseWriter writer;

    public ProblemAuthenticationEntryPoint(ProblemDetailsFactory problems, ProblemResponseWriter writer) {
        this.problems = problems;
        this.writer = writer;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        writer.write(response, problems.create(HttpStatus.UNAUTHORIZED, "unauthenticated"));
    }
}

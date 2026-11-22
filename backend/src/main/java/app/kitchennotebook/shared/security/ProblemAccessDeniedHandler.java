package app.kitchennotebook.shared.security;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.stereotype.Component;

import app.kitchennotebook.shared.web.ProblemDetailsFactory;
import app.kitchennotebook.shared.web.ProblemResponseWriter;

/**
 * Answers denied requests, including a missing or invalid CSRF token (PLT-06), with 403 problem details.
 */
@Component
public class ProblemAccessDeniedHandler implements AccessDeniedHandler {

    private final ProblemDetailsFactory problems;
    private final ProblemResponseWriter writer;

    public ProblemAccessDeniedHandler(ProblemDetailsFactory problems, ProblemResponseWriter writer) {
        this.problems = problems;
        this.writer = writer;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        String slug = accessDeniedException instanceof CsrfException ? "csrf" : "forbidden";
        writer.write(response, problems.create(HttpStatus.FORBIDDEN, slug));
    }
}

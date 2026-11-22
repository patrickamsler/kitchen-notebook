package app.kitchennotebook.shared.web;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.lang.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.validation.method.ParameterErrors;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Maps every exception raised in a controller to RFC 9457 problem details (PLT-08). Title and detail come from
 * messages.properties (PLT-10); unexpected errors are logged with a correlation ID and answered without internals.
 */
@RestControllerAdvice
public class ProblemDetailsAdvice extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ProblemDetailsAdvice.class);

    private static final Map<Integer, String> SLUGS_BY_STATUS = Map.ofEntries(
            Map.entry(400, "bad-request"),
            Map.entry(401, "unauthenticated"),
            Map.entry(403, "forbidden"),
            Map.entry(404, "not-found"),
            Map.entry(405, "method-not-allowed"),
            Map.entry(406, "not-acceptable"),
            Map.entry(409, "conflict"),
            Map.entry(413, "payload-too-large"),
            Map.entry(415, "unsupported-media-type"),
            Map.entry(500, "internal"),
            Map.entry(503, "unavailable"));

    private final ProblemDetailsFactory problems;

    public ProblemDetailsAdvice(ProblemDetailsFactory problems) {
        this.problems = problems;
    }

    @ExceptionHandler(ProblemException.class)
    ResponseEntity<Object> handleProblem(ProblemException ex) {
        return respond(problems.create(ex.getStatus(), ex.getSlug(), ex.getDetailArguments()));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Object> handleAuthentication(AuthenticationException ex) {
        return respond(problems.create(HttpStatus.UNAUTHORIZED, "unauthenticated"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex) {
        return respond(problems.create(HttpStatus.FORBIDDEN, "forbidden"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(Exception ex) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unexpected error, correlationId={}", correlationId, ex);
        ProblemDetail problem = problems.create(HttpStatus.INTERNAL_SERVER_ERROR, "internal", correlationId);
        problem.setProperty("correlationId", correlationId);
        return respond(problem);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, @Nullable Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        ProblemDetail problem;
        if (ex instanceof MethodArgumentNotValidException invalid) {
            problem = validationProblem(fieldErrors(invalid.getBindingResult().getFieldErrors()));
        } else if (ex instanceof HandlerMethodValidationException invalid) {
            problem = validationProblem(parameterErrors(invalid));
        } else if (ex instanceof HttpMessageNotReadableException) {
            problem = problems.create(statusCode, "malformed-request");
        } else {
            problem = problems.create(statusCode, SLUGS_BY_STATUS.getOrDefault(statusCode.value(), "error"));
        }
        return super.handleExceptionInternal(ex, problem, headers, statusCode, request);
    }

    private ProblemDetail validationProblem(List<Map<String, String>> errors) {
        ProblemDetail problem = problems.create(HttpStatus.BAD_REQUEST, "validation");
        problem.setProperty("errors", errors);
        return problem;
    }

    private List<Map<String, String>> fieldErrors(List<FieldError> fieldErrors) {
        List<Map<String, String>> errors = new ArrayList<>();
        for (FieldError error : fieldErrors) {
            errors.add(Map.of("field", error.getField(), "message", resolve(error)));
        }
        return errors;
    }

    private List<Map<String, String>> parameterErrors(HandlerMethodValidationException ex) {
        List<Map<String, String>> errors = new ArrayList<>();
        ex.getParameterValidationResults().forEach(result -> {
            if (result instanceof ParameterErrors parameterErrors) {
                errors.addAll(fieldErrors(parameterErrors.getFieldErrors()));
            } else {
                String field = result.getMethodParameter().getParameterName();
                result.getResolvableErrors().forEach(error ->
                        errors.add(Map.of("field", field == null ? "" : field, "message", resolve(error))));
            }
        });
        return errors;
    }

    private String resolve(MessageSourceResolvable error) {
        return getMessageSource() != null
                ? getMessageSource().getMessage(error, LocaleContextHolder.getLocale())
                : String.valueOf(error.getDefaultMessage());
    }

    private static ResponseEntity<Object> respond(ProblemDetail problem) {
        return ResponseEntity.status(problem.getStatus()).body(problem);
    }
}

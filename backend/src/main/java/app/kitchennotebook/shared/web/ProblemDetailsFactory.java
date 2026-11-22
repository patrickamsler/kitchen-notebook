package app.kitchennotebook.shared.web;

import java.net.URI;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

/**
 * Creates RFC 9457 problem details with a stable type {@code urn:kn:problem:<slug>} and title and detail from
 * messages.properties ({@code problem.<slug>.title}, {@code problem.<slug>.detail}).
 */
@Component
public class ProblemDetailsFactory {

    public static final String TYPE_PREFIX = "urn:kn:problem:";

    private final MessageSource messageSource;

    public ProblemDetailsFactory(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public ProblemDetail create(HttpStatusCode status, String slug, Object... detailArguments) {
        ProblemDetail problem = ProblemDetail.forStatus(status);
        problem.setType(URI.create(TYPE_PREFIX + slug));
        HttpStatus known = HttpStatus.resolve(status.value());
        String fallbackTitle = known != null ? known.getReasonPhrase() : "Error";
        problem.setTitle(message("problem." + slug + ".title", null, fallbackTitle));
        problem.setDetail(message("problem." + slug + ".detail", detailArguments, null));
        return problem;
    }

    public String message(String code, Object[] arguments, String defaultMessage) {
        return messageSource.getMessage(code, arguments, defaultMessage, LocaleContextHolder.getLocale());
    }
}

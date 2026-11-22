package app.kitchennotebook.shared.web;

import org.springframework.http.HttpStatusCode;

/**
 * Base for exceptions that map to a problem-details response. The slug selects the problem type
 * {@code urn:kn:problem:<slug>} and the message keys {@code problem.<slug>.title} / {@code problem.<slug>.detail};
 * the arguments fill the placeholders of the detail message.
 */
public class ProblemException extends RuntimeException {

    private final HttpStatusCode status;
    private final String slug;
    private final transient Object[] detailArguments;

    public ProblemException(HttpStatusCode status, String slug, Object... detailArguments) {
        super(slug);
        this.status = status;
        this.slug = slug;
        this.detailArguments = detailArguments.clone();
    }

    public HttpStatusCode getStatus() {
        return status;
    }

    public String getSlug() {
        return slug;
    }

    public Object[] getDetailArguments() {
        return detailArguments.clone();
    }
}

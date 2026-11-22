package app.kitchennotebook.shared.security;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param absoluteTimeout maximum age of a session regardless of activity; shopping-list polling would otherwise keep
 *                        a session alive forever
 */
@ConfigurationProperties("kn.session")
public record SessionProperties(Duration absoluteTimeout) {
}

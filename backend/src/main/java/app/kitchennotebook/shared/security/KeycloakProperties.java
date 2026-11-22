package app.kitchennotebook.shared.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Keycloak realm and the confidential web client {@code kn-web}.
 *
 * @param issuerUri realm URL, e.g. {@code http://localhost:8180/realms/kitchen-notebook}; the same host is used by
 *                  the browser and the backend, so the token issuer always matches
 */
@ConfigurationProperties("kn.auth.keycloak")
public record KeycloakProperties(String issuerUri, String clientId, String clientSecret) {
}

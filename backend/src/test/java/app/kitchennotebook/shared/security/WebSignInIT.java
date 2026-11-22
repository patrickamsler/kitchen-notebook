package app.kitchennotebook.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistrar;

import app.kitchennotebook.support.KnKeycloak;
import app.kitchennotebook.support.TestBrowser;
import app.kitchennotebook.support.TestcontainersConfiguration;

/**
 * Sign-in and sign-out through the real Authorization Code flow with Keycloak (ADR-009).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import({TestcontainersConfiguration.class, WebSignInIT.KeycloakProperties.class})
class WebSignInIT {

    /** A JWT (access, refresh or ID token) is three base64url parts, the first starting with "eyJ". */
    private static final Pattern JWT = Pattern.compile("eyJ[\\w-]+\\.[\\w-]+\\.[\\w-]*");

    @LocalServerPort
    int port;

    TestBrowser browser;

    @BeforeEach
    void setUp() {
        KnKeycloak.allowRedirectsTo(port);
        browser = new TestBrowser("http://localhost:" + port);
    }

    @Test
    @DisplayName("PLT-02 sign-in issues an HttpOnly SameSite=Lax session cookie and no token reaches the browser")
    void PLT02_signInIssuesSessionCookieOnly() {
        // given a verified Keycloak user
        // when they sign in and the app calls /api/me
        var afterSignIn = browser.signIn("anna@example.com", KnKeycloak.TEST_USER_PASSWORD);
        var me = browser.get("/api/me");

        // then they return to the web app with a session cookie
        assertThat(TestBrowser.location(afterSignIn)).isIn("/", "http://localhost:" + port + "/");
        assertThat(browser.backendSetCookieHeaders())
                .anySatisfy(header -> assertThat(header)
                        .startsWith("KN_SESSION=").contains("HttpOnly").contains("SameSite=Lax"));
        assertThat(me.statusCode()).isEqualTo(200);
        assertThat(me.body()).contains("\"email\":\"anna@example.com\"");

        // and no OAuth2 token is in any cookie or response of the backend
        assertThat(browser.backendSetCookieHeaders()).noneMatch(header -> JWT.matcher(header).find());
        assertThat(browser.backendResponseBodies()).noneMatch(body -> JWT.matcher(body).find());
    }

    @Test
    @DisplayName("PLT-04 sign-out invalidates the session and ends the Keycloak session")
    void PLT04_signOutInvalidatesSession() {
        // given a signed-in user
        browser.signIn("anna@example.com", KnKeycloak.TEST_USER_PASSWORD);
        String oldSession = browser.cookie("KN_SESSION").orElseThrow();
        assertThat(browser.get("/api/me").statusCode()).isEqualTo(200);
        String xsrf = browser.cookie("XSRF-TOKEN").orElseThrow();

        // when they sign out (form POST with the CSRF token, as the web app does)
        var logout = browser.postForm("/logout", Map.of("_csrf", xsrf), Map.of());
        var endSession = browser.followRedirects(logout);

        // then the backend redirects through Keycloak's end-session endpoint back to the app
        assertThat(TestBrowser.location(logout)).startsWith(KnKeycloak.issuerUri() + "/protocol/openid-connect/logout");
        assertThat(endSession.uri().toString()).isEqualTo("http://localhost:" + port + "/");

        // and a later call with the old cookie returns 401
        browser.setBackendCookie("KN_SESSION", oldSession);
        assertThat(browser.get("/api/me").statusCode()).isEqualTo(401);

        // and starting sign-in again asks for credentials at Keycloak
        var signInAgain = browser.followRedirects(browser.get("/oauth2/authorization/keycloak"));
        assertThat(TestBrowser.loginFormAction(signInAgain.body())).isPresent();
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class KeycloakProperties {

        @Bean
        DynamicPropertyRegistrar knKeycloakProperties() {
            return registry -> KnKeycloak.properties().forEach((name, value) -> registry.add(name, () -> value));
        }
    }
}

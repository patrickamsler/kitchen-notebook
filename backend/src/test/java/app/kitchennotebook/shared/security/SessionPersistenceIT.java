package app.kitchennotebook.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import app.kitchennotebook.KitchenNotebookApplication;
import app.kitchennotebook.support.KnKeycloak;
import app.kitchennotebook.support.KnPostgres;
import app.kitchennotebook.support.TestBrowser;

/**
 * Sessions live in PostgreSQL (Spring Session JDBC), so they survive restarts and work across instances (PLT-05).
 * Two application contexts are started one after the other on the same database.
 */
class SessionPersistenceIT {

    @Test
    @DisplayName("PLT-05 a session stays valid after the backend restarts")
    void PLT05_sessionValidAfterRestart() {
        // given a user signed in on the first instance
        String session;
        try (ConfigurableApplicationContext first = startInstance()) {
            int port = port(first);
            KnKeycloak.allowRedirectsTo(port);
            TestBrowser browser = new TestBrowser("http://localhost:" + port);
            browser.signIn("ben@example.com", KnKeycloak.TEST_USER_PASSWORD);
            assertThat(browser.get("/api/me").statusCode()).isEqualTo(200);
            session = browser.cookie("KN_SESSION").orElseThrow();
        }

        // when the backend restarts and the same cookie is sent
        try (ConfigurableApplicationContext second = startInstance()) {
            TestBrowser browser = new TestBrowser("http://localhost:" + port(second));
            browser.setBackendCookie("KN_SESSION", session);
            var me = browser.get("/api/me");

            // then
            assertThat(me.statusCode()).isEqualTo(200);
            assertThat(me.body()).contains("\"email\":\"ben@example.com\"");
        }
    }

    private static ConfigurableApplicationContext startInstance() {
        Map<String, Object> properties = new HashMap<>();
        properties.putAll(KnPostgres.properties());
        properties.putAll(KnKeycloak.properties());
        properties.put("server.port", "0");
        // Command-line arguments take precedence over application.yaml and the imported ../.env.
        String[] args = properties.entrySet().stream()
                .map(property -> "--" + property.getKey() + "=" + property.getValue())
                .toArray(String[]::new);
        return new SpringApplicationBuilder(KitchenNotebookApplication.class).run(args);
    }

    private static int port(ConfigurableApplicationContext context) {
        return Integer.parseInt(context.getEnvironment().getRequiredProperty("local.server.port"));
    }
}

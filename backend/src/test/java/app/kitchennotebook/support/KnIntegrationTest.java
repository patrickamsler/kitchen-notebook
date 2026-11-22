package app.kitchennotebook.support;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;

/**
 * Integration test against the shared PostgreSQL container, with MockMvc. Keycloak is not running: the client
 * registration points at an unreachable issuer, so sign-in is simulated with {@code oidcLogin()}.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@SpringBootTest(properties = {
        "kn.auth.keycloak.issuer-uri=http://localhost:1/realms/kitchen-notebook",
        "kn.auth.keycloak.client-secret=test-secret"
})
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public @interface KnIntegrationTest {
}

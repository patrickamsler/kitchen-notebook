package app.kitchennotebook.support;

import java.util.Map;

import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.MountableFile;

/**
 * One PostgreSQL 18 container for all integration tests, bootstrapped with the same init script as Compose
 * (infra/postgres/init/): Flyway connects as {@code kn_owner}, the application as {@code kn_app}.
 */
public final class KnPostgres {

    public static final String DATABASE = "kitchen_notebook";
    public static final String OWNER_PASSWORD = "test-kn-owner-pw";
    public static final String APP_PASSWORD = "test-kn-app-pw";

    private static final PostgreSQLContainer CONTAINER = new PostgreSQLContainer("postgres:18.7-alpine")
            .withCopyFileToContainer(MountableFile.forClasspathResource("postgres-init/", 0755),
                    "/docker-entrypoint-initdb.d/")
            .withEnv("KN_OWNER_PASSWORD", OWNER_PASSWORD)
            .withEnv("KN_APP_PASSWORD", APP_PASSWORD)
            .withEnv("KEYCLOAK_DB_PASSWORD", "test-keycloak-db-pw");

    static {
        CONTAINER.start();
    }

    private KnPostgres() {
    }

    public static String jdbcUrl() {
        return "jdbc:postgresql://%s:%d/%s".formatted(CONTAINER.getHost(), CONTAINER.getMappedPort(5432), DATABASE);
    }

    /** Connection settings for the application context, including the test-only migrations. */
    public static Map<String, Object> properties() {
        return Map.of(
                "spring.datasource.url", jdbcUrl(),
                "spring.datasource.username", "kn_app",
                "spring.datasource.password", APP_PASSWORD,
                "spring.flyway.user", "kn_owner",
                "spring.flyway.password", OWNER_PASSWORD,
                "spring.flyway.locations", "classpath:db/migration,classpath:db/test-migration");
    }
}

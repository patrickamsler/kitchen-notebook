package app.kitchennotebook.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistrar;

/**
 * Points the application at the shared {@link KnPostgres} container.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    @Bean
    DynamicPropertyRegistrar knPostgresProperties() {
        return registry -> KnPostgres.properties().forEach((name, value) -> registry.add(name, () -> value));
    }
}

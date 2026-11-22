package app.kitchennotebook.shared.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves every application REST controller under {@code /api}, matching the server URL in api/openapi.yaml.
 */
@Configuration(proxyBeanMethods = false)
public class ApiPathConfiguration implements WebMvcConfigurer {

    public static final String API_PREFIX = "/api";

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(API_PREFIX,
                HandlerTypePredicate.forBasePackage("app.kitchennotebook")
                        .and(HandlerTypePredicate.forAnnotation(RestController.class)));
    }
}

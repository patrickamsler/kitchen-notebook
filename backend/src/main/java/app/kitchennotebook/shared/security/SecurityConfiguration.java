package app.kitchennotebook.shared.security;

import java.time.Clock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.savedrequest.NullRequestCache;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

/**
 * The session security chain for the web app (ADR-009): OIDC sign-in with Keycloak as a confidential client,
 * a session cookie, CSRF for state-changing requests and RP-initiated sign-out. The bearer-JWT chain for a
 * native app is added later as a second chain on the same endpoints.
 */
@Configuration(proxyBeanMethods = false)
public class SecurityConfiguration {

    @Bean
    SecurityFilterChain sessionSecurityFilterChain(HttpSecurity http,
            ClientRegistrationRepository clientRegistrations,
            ProblemAuthenticationEntryPoint problemEntryPoint,
            ProblemAccessDeniedHandler problemAccessDeniedHandler,
            SessionProperties sessionProperties,
            @Value("${server.servlet.session.cookie.name}") String sessionCookieName) throws Exception {

        OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler =
                new OidcClientInitiatedLogoutSuccessHandler(clientRegistrations);
        logoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}/");

        // Plain (not XOR-masked) token handling: the SPA sends the raw XSRF-TOKEN cookie value, as header for API
        // calls and as the _csrf form field for the sign-out form. Tokens are never rendered into response bodies.
        CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();

        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/error").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated())
                .oauth2Login(login -> login.defaultSuccessUrl("/", true))
                // Sign-in always returns to "/", so failed requests are not saved (and API calls create no session).
                .requestCache(cache -> cache.requestCache(new NullRequestCache()))
                .logout(logout -> logout
                        .logoutSuccessHandler(logoutSuccessHandler)
                        .invalidateHttpSession(true)
                        .deleteCookies(sessionCookieName))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(csrfRequestHandler))
                .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class)
                .addFilterBefore(new AbsoluteSessionTimeoutFilter(sessionProperties.absoluteTimeout(), Clock.systemUTC()),
                        SecurityContextHolderFilter.class)
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(problemEntryPoint,
                                PathPatternRequestMatcher.withDefaults().matcher("/api/**"))
                        .accessDeniedHandler(problemAccessDeniedHandler));
        return http.build();
    }
}

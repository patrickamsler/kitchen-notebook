package app.kitchennotebook.shared.security;

import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

/**
 * Registers Keycloak as the OIDC provider {@code keycloak} from {@link KeycloakProperties}.
 *
 * <p>The endpoints are derived from Keycloak's fixed URL layout instead of OIDC discovery, so the backend starts
 * without Keycloak being reachable. The end-session endpoint is included for RP-initiated logout.
 */
@Configuration(proxyBeanMethods = false)
public class KeycloakClientRegistrationConfiguration {

    public static final String REGISTRATION_ID = "keycloak";

    @Bean
    ClientRegistrationRepository clientRegistrationRepository(KeycloakProperties keycloak) {
        String issuer = keycloak.issuerUri().replaceAll("/+$", "");
        String oidc = issuer + "/protocol/openid-connect";
        ClientRegistration registration = ClientRegistration.withRegistrationId(REGISTRATION_ID)
                .clientName("Keycloak")
                .clientId(keycloak.clientId())
                .clientSecret(keycloak.clientSecret())
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .issuerUri(issuer)
                .authorizationUri(oidc + "/auth")
                .tokenUri(oidc + "/token")
                .jwkSetUri(oidc + "/certs")
                .userInfoUri(oidc + "/userinfo")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .providerConfigurationMetadata(Map.of("end_session_endpoint", oidc + "/logout"))
                .build();
        return new InMemoryClientRegistrationRepository(registration);
    }
}

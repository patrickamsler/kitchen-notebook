package app.kitchennotebook.support;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.keycloak.admin.client.resource.ClientsResource;
import org.keycloak.representations.idm.ClientRepresentation;

import dasniko.testcontainers.keycloak.KeycloakContainer;

/**
 * One Keycloak container with the committed realm import (infra/keycloak/), for tests of the real sign-in flow.
 */
public final class KnKeycloak {

    public static final String REALM = "kitchen-notebook";
    public static final String CLIENT_ID = "kn-web";
    public static final String CLIENT_SECRET = "test-kn-web-secret";
    public static final String TEST_USER_PASSWORD = "test-user-pw";

    private static final KeycloakContainer CONTAINER = new KeycloakContainer("quay.io/keycloak/keycloak:26.8.2")
            .withRealmImportFile("keycloak/realm-kitchen-notebook.json")
            .withEnv("KN_WEB_CLIENT_SECRET", CLIENT_SECRET)
            .withEnv("KN_TEST_USER_PASSWORD", TEST_USER_PASSWORD);

    static {
        CONTAINER.start();
    }

    private KnKeycloak() {
    }

    public static String issuerUri() {
        return CONTAINER.getAuthServerUrl().replaceAll("/+$", "") + "/realms/" + REALM;
    }

    public static Map<String, Object> properties() {
        return Map.of(
                "kn.auth.keycloak.issuer-uri", issuerUri(),
                "kn.auth.keycloak.client-id", CLIENT_ID,
                "kn.auth.keycloak.client-secret", CLIENT_SECRET);
    }

    /** Allows the sign-in and sign-out redirects of a backend running on a random port. */
    public static synchronized void allowRedirectsTo(int port) {
        ClientsResource clients = CONTAINER.getKeycloakAdminClient().realm(REALM).clients();
        ClientRepresentation client = clients.findByClientId(CLIENT_ID).getFirst();
        String base = "http://localhost:" + port;

        List<String> redirectUris = new ArrayList<>(client.getRedirectUris());
        redirectUris.add(base + "/login/oauth2/code/keycloak");
        client.setRedirectUris(redirectUris);

        Map<String, String> attributes = new HashMap<>(client.getAttributes());
        attributes.merge("post.logout.redirect.uris", base + "/", (old, added) -> old + "##" + added);
        client.setAttributes(attributes);

        clients.get(client.getId()).update(client);
    }
}

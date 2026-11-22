package app.kitchennotebook.shared.security;

/**
 * The signed-in user, independent of the sign-in path (web session now, bearer JWT for a native app later).
 *
 * @param subject Keycloak subject ({@code sub}), the stable user ID
 */
public record CurrentUser(String subject, String email, boolean emailVerified, String displayName) {
}

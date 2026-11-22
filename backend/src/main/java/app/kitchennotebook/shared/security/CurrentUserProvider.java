package app.kitchennotebook.shared.security;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Resolves the {@link CurrentUser} of the current request from the security context. Inject it where the user is
 * needed; generated API interfaces cannot take extra handler parameters. A {@code Jwt} principal (native app,
 * ADR-009) plugs in here later.
 */
@Component
public class CurrentUserProvider {

    public CurrentUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OidcUser oidcUser) {
            return fromOidcUser(oidcUser);
        }
        throw new AuthenticationCredentialsNotFoundException("No signed-in user");
    }

    static CurrentUser fromOidcUser(OidcUser user) {
        return new CurrentUser(
                user.getSubject(),
                user.getEmail(),
                Boolean.TRUE.equals(user.getEmailVerified()),
                displayName(user));
    }

    private static String displayName(OidcUser user) {
        if (StringUtils.hasText(user.getFullName())) {
            return user.getFullName();
        }
        String joined = ((user.getGivenName() == null ? "" : user.getGivenName()) + " "
                + (user.getFamilyName() == null ? "" : user.getFamilyName())).trim();
        if (StringUtils.hasText(joined)) {
            return joined;
        }
        return StringUtils.hasText(user.getPreferredUsername()) ? user.getPreferredUsername() : user.getEmail();
    }
}

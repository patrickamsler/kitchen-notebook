package app.kitchennotebook.accounts.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import app.kitchennotebook.api.MeApi;
import app.kitchennotebook.api.model.CurrentUser;
import app.kitchennotebook.shared.security.CurrentUserProvider;

/**
 * {@code GET /api/me}: the signed-in identity from Keycloak (PLT-03). No profile table yet.
 */
@RestController
public class MeController implements MeApi {

    private final CurrentUserProvider currentUserProvider;

    public MeController(CurrentUserProvider currentUserProvider) {
        this.currentUserProvider = currentUserProvider;
    }

    @Override
    public ResponseEntity<CurrentUser> getCurrentUser() {
        var user = currentUserProvider.currentUser();
        return ResponseEntity.ok(new CurrentUser(user.subject(), user.email(), user.emailVerified(), user.displayName()));
    }
}

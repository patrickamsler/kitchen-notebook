package app.kitchennotebook.accounts.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import app.kitchennotebook.support.KnIntegrationTest;

@KnIntegrationTest
class CurrentUserIT {

    @Autowired
    MockMvc mvc;

    @Test
    @DisplayName("PLT-03 GET /api/me returns the signed-in identity")
    void PLT03_meReturnsSignedInIdentity() throws Exception {
        // given a user signed in as anna@example.com
        var anna = oidcLogin().idToken(token -> token
                .subject("3f1c2b9e-7a64-4f3b-9a51-2d8c3e0f4b11")
                .claim("email", "anna@example.com")
                .claim("email_verified", true)
                .claim("name", "Anna Example"));

        // when
        var result = mvc.perform(get("/api/me").with(anna));

        // then
        result.andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.subject").value("3f1c2b9e-7a64-4f3b-9a51-2d8c3e0f4b11"))
                .andExpect(jsonPath("$.email").value("anna@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.displayName").value("Anna Example"));
    }
}

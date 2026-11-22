package app.kitchennotebook.shared.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import app.kitchennotebook.support.KnIntegrationTest;

@KnIntegrationTest
class CsrfProtectionIT {

    @Autowired
    MockMvc mvc;

    @Test
    @DisplayName("PLT-06 state-changing request without the CSRF header returns 403 problem details")
    void PLT06_postWithoutCsrfReturns403() throws Exception {
        // given a signed-in user
        // when
        var result = mvc.perform(post("/logout").with(oidcLogin()));

        // then
        result.andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("urn:kn:problem:csrf"));
    }

    @Test
    @DisplayName("PLT-06 request carrying the XSRF-TOKEN cookie value as header is accepted")
    void PLT06_postWithCsrfAccepted() throws Exception {
        // given a signed-in user whose app read the XSRF-TOKEN cookie
        Cookie xsrf = mvc.perform(get("/api/me").with(oidcLogin()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertThat(xsrf).isNotNull();
        assertThat(xsrf.isHttpOnly()).isFalse();

        // when the app signs out, sending the cookie value as header
        var result = mvc.perform(post("/logout").with(oidcLogin())
                .cookie(xsrf)
                .header("X-XSRF-TOKEN", xsrf.getValue()));

        // then it is not rejected for CSRF
        result.andExpect(status().is3xxRedirection());
    }
}

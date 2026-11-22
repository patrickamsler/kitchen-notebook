package app.kitchennotebook.shared.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.InputStream;
import java.util.Properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import app.kitchennotebook.support.KnIntegrationTest;

@KnIntegrationTest
@Import(ProblemDetailsIT.ProbeController.class)
class ProblemDetailsIT {

    @Autowired
    MockMvc mvc;

    @Test
    @DisplayName("PLT-08 validation error is 400 problem details listing each invalid field")
    void PLT08_validationErrorListsFields() throws Exception {
        // given a body that violates the constraints
        String body = """
                { "name": " ", "code": "TOO-LONG" }
                """;

        // when
        var result = mvc.perform(post("/api/probe/validate").with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(body));

        // then
        result.andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("urn:kn:problem:validation"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors[*].field", containsInAnyOrder("name", "code")))
                .andExpect(jsonPath("$.errors[0].message").isNotEmpty());
    }

    @Test
    @DisplayName("PLT-08 unexpected failure is 500 problem details without stack trace or class names")
    void PLT08_unexpectedErrorHidesInternals() throws Exception {
        // given an endpoint failing unexpectedly
        // when
        var result = mvc.perform(get("/api/probe/boom").with(oidcLogin()));

        // then
        String response = result.andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("urn:kn:problem:internal"))
                .andExpect(jsonPath("$.correlationId").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        assertThat(response)
                .doesNotContain("secret-internal-detail")
                .doesNotContain("IllegalStateException")
                .doesNotContain("app.kitchennotebook")
                .doesNotContain("trace");
    }

    @Test
    @DisplayName("PLT-10 problem title and detail come from the English message bundle")
    void PLT10_apiMessageFromBundle() throws Exception {
        // given the English bundle
        Properties bundle = new Properties();
        try (InputStream in = getClass().getResourceAsStream("/messages.properties")) {
            bundle.load(in);
        }

        // when an API error with a message key is returned
        var result = mvc.perform(get("/api/me"));

        // then
        result.andExpect(jsonPath("$.title").value(bundle.getProperty("problem.unauthenticated.title")))
                .andExpect(jsonPath("$.detail").value(bundle.getProperty("problem.unauthenticated.detail")));
    }

    @RestController
    static class ProbeController {

        record ProbeBody(@NotBlank String name, @Size(max = 3) String code) {
        }

        @PostMapping("/probe/validate")
        void validate(@Valid @RequestBody ProbeBody body) {
        }

        @GetMapping("/probe/boom")
        void boom() {
            throw new IllegalStateException("secret-internal-detail");
        }
    }
}

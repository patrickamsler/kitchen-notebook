package app.kitchennotebook.shared.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import app.kitchennotebook.support.KnIntegrationTest;

@KnIntegrationTest
class ApiAuthenticationIT {

    @Autowired
    MockMvc mvc;

    @Test
    @DisplayName("PLT-01 API call without a session returns 401 problem details, not a redirect")
    void PLT01_apiWithoutSessionReturns401() throws Exception {
        // given a browser without a session cookie
        // when
        var result = mvc.perform(get("/api/me"));

        // then
        result.andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(header().doesNotExist("Location"))
                .andExpect(jsonPath("$.type").value("urn:kn:problem:unauthenticated"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("PLT-01 health stays public and reveals no component details")
    void PLT01_healthIsPublic() throws Exception {
        // given a client without a session
        // when
        var result = mvc.perform(get("/actuator/health"));

        // then
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist())
                .andExpect(jsonPath("$.details").doesNotExist());
    }
}

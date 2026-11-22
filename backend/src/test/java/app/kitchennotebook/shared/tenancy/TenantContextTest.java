package app.kitchennotebook.shared.tenancy;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class TenantContextTest {

    @Test
    @DisplayName("PLT-07 setting the tenant context outside a transaction fails fast")
    void PLT07_setFailsWithoutTransaction() {
        // given no active transaction
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        TenantContext tenantContext = new TenantContext(jdbc);

        // when / then
        assertThatThrownBy(() -> tenantContext.set(UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("inside a transaction");
        verifyNoInteractions(jdbc);
    }
}
